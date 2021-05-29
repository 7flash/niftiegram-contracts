pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NiftieMarketplace {
    struct NiftieOffer {
        uint256 id;
        address tokenAddress;
        uint256 tokenId;
        address payable seller;
        uint256 askingPrice;
        bool isAccepted;
    }

    NiftieOffer[] public offers;
    mapping (address => mapping (uint256 => bool)) isOfferActive;

    event OfferAdded(uint256 id, uint256 tokenId, address tokenAddress, uint256 askingPrice);
    event OfferAccepted(uint256 id, address buyer, uint256 askingPrice);

    modifier isNiftieOwner (address tokenAddress, uint256 tokenId) {
        IERC721 tokenContract = IERC721(tokenAddress);
        require(tokenContract.ownerOf(tokenId) == msg.sender, "sender should be niftie owner");
        _;
    }

    modifier isApprovedTransfer(address tokenAddress, uint256 tokenId) {
        IERC721 tokenContract = IERC721(tokenAddress);
        require(tokenContract.getApproved(tokenId) == address(this), "marketplace should be approved to transfer");
        _;
    }

    modifier isExistingOffer(uint256 id) {
        require(id < offers.length && offers[id].id == id, "niftie should be listed for sale");
        _;
    }

    modifier isAvailableOffer(uint256 id) {
        require(offers[id].isAccepted == false, "this offer seems to be accepted already");
        _;
    }

    function addOffer(uint256 tokenId, address tokenAddress, uint256 askingPrice)
        isNiftieOwner(tokenAddress, tokenId)
        isApprovedTransfer(tokenAddress, tokenId)
        external returns (uint256)
    {
        require (isOfferActive[tokenAddress][tokenId] == false, "niftie already on sale");
        
        uint256 newOfferId = offers.length;

        offers.push(
            NiftieOffer(
                newOfferId,
                tokenAddress,
                tokenId,
                payable(msg.sender),
                askingPrice,
                false
            )
        );

        isOfferActive[tokenAddress][tokenId] = true;

        emit OfferAdded(newOfferId, tokenId, tokenAddress, askingPrice);

        return newOfferId;
    }

    function acceptOffer(uint256 id)
        isExistingOffer(id)
        isAvailableOffer(id)
        isApprovedTransfer(offers[id].tokenAddress, offers[id].tokenId)
        payable external
    {
        require (msg.value >= offers[id].askingPrice, "current price is above given value");
        require (msg.sender != offers[id].seller);

        offers[id].isAccepted = true;
        isOfferActive[offers[id].tokenAddress][offers[id].tokenId] = false;

        IERC721(offers[id].tokenAddress).safeTransferFrom(offers[id].seller, msg.sender, offers[id].tokenId);
        offers[id].seller.transfer(msg.value);

        emit OfferAccepted(id, msg.sender, offers[id].askingPrice);
    }
}