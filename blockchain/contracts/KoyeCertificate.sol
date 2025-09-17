// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract KoyeCertificate is ERC721, Ownable, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter; using Strings for uint256;
    Counters.Counter private _tokenIdCounter;
    enum ContentType { Image, Music, Video, Other }
    struct Certificate { bytes32 metadataHash; uint8 contentType; uint64 createdAt; address creator; }
    mapping(uint256 => Certificate) private _certificates;
    string private _baseTokenURI;
    mapping(address => bool) public isMinter;
    event CertificateMinted(uint256 indexed tokenId, address indexed creator, bytes32 metadataHash, uint8 contentType, string tokenURI);
    constructor(string memory name_, string memory symbol_, string memory baseURI_) ERC721(name_, symbol_) { _baseTokenURI = baseURI_; }
    modifier onlyMinter() { require(isMinter[msg.sender] || owner() == msg.sender, "Koye: not minter"); _; }
    function setMinter(address minter, bool allowed) external onlyOwner { isMinter[minter] = allowed; }
    function setBaseURI(string calldata baseURI_) external onlyOwner { _baseTokenURI = baseURI_; }
    function _baseURI() internal view override returns (string memory) { return _baseTokenURI; }
    function mintCertificate(address to, bytes32 metadataHash, uint8 contentType) external whenNotPaused nonReentrant onlyMinter returns (uint256) {
        require(metadataHash != bytes32(0), "Koye: invalid");
        _tokenIdCounter.increment(); uint256 tokenId = _tokenIdCounter.current();
        _safeMint(to, tokenId);
        _certificates[tokenId] = Certificate({metadataHash: metadataHash, contentType: contentType, createdAt: uint64(block.timestamp), creator: to});
        string memory tokenURI_ = bytes(_baseTokenURI).length > 0 ? string(abi.encodePacked(_baseTokenURI, tokenId.toString())) : "";
        emit CertificateMinted(tokenId,to,metadataHash,contentType,tokenURI_);
        return tokenId;
    }
    function batchMint(address[] calldata to, bytes32[] calldata metadataHashes, uint8[] calldata contentTypes) external whenNotPaused nonReentrant onlyMinter returns (uint256[] memory) {
        uint256 len = to.length; require(len>0 && metadataHashes.length==len && contentTypes.length==len,"Koye: bad arrays");
        uint256[] memory tokenIds = new uint256[](len);
        for(uint256 i=0;i<len;i++){ require(metadataHashes[i]!=bytes32(0),"Koye: invalid"); _tokenIdCounter.increment(); uint256 tokenId=_tokenIdCounter.current();
            _safeMint(to[i], tokenId);
            _certificates[tokenId]=Certificate({metadataHash:metadataHashes[i],contentType:contentTypes[i],createdAt:uint64(block.timestamp),creator:to[i]});
            string memory tokenURI_ = bytes(_baseTokenURI).length > 0 ? string(abi.encodePacked(_baseTokenURI, tokenId.toString())) : "";
            emit CertificateMinted(tokenId,to[i],metadataHashes[i],contentTypes[i],tokenURI_);
            tokenIds[i]=tokenId;
        }
        return tokenIds;
    }
    function getCertificate(uint256 tokenId) external view returns (bytes32,uint8,uint64,address){
        require(_exists(tokenId),"no token"); Certificate memory c = _certificates[tokenId]; return (c.metadataHash,c.contentType,c.createdAt,c.creator);
    }
    function tokenURI(uint256 tokenId) public view override returns (string memory){
        require(_exists(tokenId),"no token"); string memory base=_baseURI(); return bytes(base).length>0?string(abi.encodePacked(base,tokenId.toString())):"";
    }
    function _beforeTokenTransfer(address from,address to,uint256 tokenId,uint256 batchSize) internal override { super._beforeTokenTransfer(from,to,tokenId,batchSize); require(!paused(),"paused"); }
}
