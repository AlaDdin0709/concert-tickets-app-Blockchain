// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ConcertTickets is ERC721, ERC721Enumerable, Ownable {
    
    // Compteurs manuels pour les IDs des événements et des billets
    uint256 private _eventIds;
    uint256 private _tokenIds;
    
    // Structure pour définir un événement
    struct Event {
        uint256 id;
        string name;
        string venue;
        uint256 date;
        uint256 ticketPrice;
        uint256 totalSeats;
        uint256 soldTickets;
        address organizer;
        bool isActive;
    }
    
    // Structure pour définir un billet
    struct Ticket {
        uint256 eventId;
        uint256 seatNumber;
        bool isUsed;
        uint256 purchaseDate;
        address originalBuyer;
    }
    
    // Mappings
    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => mapping(uint256 => bool)) public seatTaken; // eventId => seatNumber => taken
    mapping(uint256 => mapping(uint256 => uint256)) public seatToTicket; // eventId => seatNumber => ticketId
    
    // Commission de la plateforme (2.5%)
    uint256 public platformFeePercent = 250; // 250 = 2.5% (base 10000)
    address public platformWallet;
    
    // Events
    event EventCreated(uint256 indexed eventId, string name, address indexed organizer);
    event TicketPurchased(uint256 indexed ticketId, uint256 indexed eventId, uint256 seatNumber, address indexed buyer);
    event TicketTransferred(uint256 indexed ticketId, address indexed from, address indexed to);
    event TicketUsed(uint256 indexed ticketId, uint256 indexed eventId);
    
    constructor() ERC721("ConcertTickets", "CTIX") Ownable(msg.sender) {
        platformWallet = msg.sender;
    }
    
    // Créer un nouvel événement
    function createEvent(
        string memory _name,
        string memory _venue,
        uint256 _date,
        uint256 _ticketPrice,
        uint256 _totalSeats
    ) public returns (uint256) {
        require(_date > block.timestamp, "Date must be in the future");
        require(_ticketPrice > 0, "Price must be greater than 0");
        require(_totalSeats > 0, "Total seats must be greater than 0");
        
        _eventIds++;
        uint256 eventId = _eventIds;
        
        events[eventId] = Event({
            id: eventId,
            name: _name,
            venue: _venue,
            date: _date,
            ticketPrice: _ticketPrice,
            totalSeats: _totalSeats,
            soldTickets: 0,
            organizer: msg.sender,
            isActive: true
        });
        
        emit EventCreated(eventId, _name, msg.sender);
        return eventId;
    }
    
    // Acheter un billet
    function purchaseTicket(uint256 _eventId, uint256 _seatNumber) public payable returns (uint256) {
        Event storage eventObj = events[_eventId];
        require(eventObj.id != 0, "Event does not exist");
        require(eventObj.isActive, "Event is not active");
        require(eventObj.date > block.timestamp, "Event has already passed");
        require(_seatNumber > 0 && _seatNumber <= eventObj.totalSeats, "Invalid seat number");
        require(!seatTaken[_eventId][_seatNumber], "Seat already taken");
        require(msg.value == eventObj.ticketPrice, "Incorrect payment amount");
        
        // Créer le billet NFT
        _tokenIds++;
        uint256 ticketId = _tokenIds;
        
        // Mint le NFT
        _safeMint(msg.sender, ticketId);
        
        // Enregistrer les détails du billet
        tickets[ticketId] = Ticket({
            eventId: _eventId,
            seatNumber: _seatNumber,
            isUsed: false,
            purchaseDate: block.timestamp,
            originalBuyer: msg.sender
        });
        
        // Marquer le siège comme pris
        seatTaken[_eventId][_seatNumber] = true;
        seatToTicket[_eventId][_seatNumber] = ticketId;
        
        // Incrémenter le nombre de billets vendus
        eventObj.soldTickets++;
        
        // Distribuer les paiements
        uint256 platformFee = (msg.value * platformFeePercent) / 10000;
        uint256 organizerPayment = msg.value - platformFee;
        
        // Envoyer à l'organisateur (97.5%)
        payable(eventObj.organizer).transfer(organizerPayment);
        
        // Envoyer la commission à la plateforme (2.5%)
        payable(platformWallet).transfer(platformFee);
        
        emit TicketPurchased(ticketId, _eventId, _seatNumber, msg.sender);
        return ticketId;
    }
    
    // Utiliser un billet (pour l'entrée au concert)
    function useTicket(uint256 _ticketId) public {
        require(_ownerOf(_ticketId) != address(0), "Ticket does not exist");
        
        Ticket storage ticket = tickets[_ticketId];
        Event storage eventObj = events[ticket.eventId];
        
        require(!ticket.isUsed, "Ticket already used");
        require(eventObj.date <= block.timestamp + 1 days, "Too early to use ticket");
        require(eventObj.date >= block.timestamp - 1 days, "Event has passed");
        
        // Marquer le billet comme utilisé
        ticket.isUsed = true;
        
        emit TicketUsed(_ticketId, ticket.eventId);
    }
    
    // Vérifier la validité d'un billet
    function verifyTicket(uint256 _ticketId) public view returns (
        bool isValid,
        uint256 eventId,
        uint256 seatNumber,
        bool isUsed,
        address currentOwner,
        string memory eventName
    ) {
        if (_ownerOf(_ticketId) == address(0)) {
            return (false, 0, 0, false, address(0), "");
        }
        
        Ticket storage ticket = tickets[_ticketId];
        Event storage eventObj = events[ticket.eventId];
        
        return (
            true,
            ticket.eventId,
            ticket.seatNumber,
            ticket.isUsed,
            ownerOf(_ticketId),
            eventObj.name
        );
    }
    
    // Obtenir les détails d'un événement
    function getEvent(uint256 _eventId) public view returns (Event memory) {
        require(events[_eventId].id != 0, "Event does not exist");
        return events[_eventId];
    }
    
    // Obtenir tous les événements actifs
    function getActiveEvents() public view returns (uint256[] memory) {
        uint256[] memory activeEvents = new uint256[](_eventIds);
        uint256 activeCount = 0;
        
        for (uint256 i = 1; i <= _eventIds; i++) {
            if (events[i].isActive) {
                activeEvents[activeCount] = i;
                activeCount++;
            }
        }
        
        // Redimensionner le tableau
        uint256[] memory result = new uint256[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeEvents[i];
        }
        
        return result;
    }
    
    // Obtenir les billets d'un utilisateur
    function getUserTickets(address _user) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(_user);
        uint256[] memory userTickets = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            userTickets[i] = tokenOfOwnerByIndex(_user, i);
        }
        
        return userTickets;
    }
    
    // Vérifier si un siège est disponible
    function isSeatAvailable(uint256 _eventId, uint256 _seatNumber) public view returns (bool) {
        return !seatTaken[_eventId][_seatNumber];
    }
    
    // Fonctions administratives
    function setPlatformFee(uint256 _feePercent) public onlyOwner {
        require(_feePercent <= 1000, "Fee cannot exceed 10%");
        platformFeePercent = _feePercent;
    }
    
    function setPlatformWallet(address _wallet) public onlyOwner {
        platformWallet = _wallet;
    }
    
    function deactivateEvent(uint256 _eventId) public {
        Event storage eventObj = events[_eventId];
        require(eventObj.id != 0, "Event does not exist");
        require(msg.sender == eventObj.organizer || msg.sender == owner(), "Not authorized");
        
        eventObj.isActive = false;
    }
    
    // Override functions pour la compatibilité
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        address from = _ownerOf(tokenId);
        address previousOwner = super._update(to, tokenId, auth);
        
        // Émettre un événement de transfert personnalisé
        if (from != address(0) && to != address(0)) {
            emit TicketTransferred(tokenId, from, to);
        }
        
        return previousOwner;
    }
    
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}