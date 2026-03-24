// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SanctuaryNFT
 * @author AI Sanctuary
 * @notice Unique NFTs representing AI Voice Models
 * @dev Rewarded to users when they reach new tiers
 */
contract SanctuaryNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Authorized minters (e.g. the backend/distributor)
    mapping(address => bool) public isMinter;

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    modifier onlyMinter() {
        require(isMinter[msg.sender] || msg.sender == owner(), "Not a minter");
        _;
    }

    constructor(address initialOwner)
        ERC721("Sanctuary Voice Model", "SANCV")
        Ownable(initialOwner)
    {
        isMinter[initialOwner] = true;
    }

    function addMinter(address _minter) external onlyOwner {
        isMinter[_minter] = true;
        emit MinterAdded(_minter);
    }

    function removeMinter(address _minter) external onlyOwner {
        isMinter[_minter] = false;
        emit MinterRemoved(_minter);
    }

    /**
     * @notice Mint a new Voice Model NFT
     * @param to Recipient address
     * @param uri IPFS or metadata URI for the NFT
     */
    function safeMint(address to, string memory uri) public onlyMinter {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // Overrides required by Solidity

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
