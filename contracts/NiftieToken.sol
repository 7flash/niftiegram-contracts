pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NiftieToken is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter public tokenIds;

    constructor () ERC721("NiftieToken", "NFT") {}

    struct Niftie {
        uint256 id;
        address creator;
        string uri;
    }

    mapping (uint256 => Niftie) public nifties;

    function create (string memory uri) public returns (uint256) {
        tokenIds.increment();
        uint256 nextId = tokenIds.current();
        _safeMint(msg.sender, nextId);

        nifties[nextId] = Niftie(nextId, msg.sender, uri);

        return nextId;
    }

    function tokenURI (uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for non-existent token");

        return nifties[tokenId].uri;
    }
}