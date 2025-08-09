// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * StrategyRegistry (MVP)
 * - Stores minimal, on-chain strategy metadata for use in feeds/homepage
 * - Heavy content (video, thumbnail, long description) should live off-chain (e.g., IPFS/Arweave/HTTPS JSON) and be referenced via `uri`
 * - No position size persisted here (kept minimal per product decision)
 */
contract StrategyRegistry {
    enum RiskLevel { Low, Medium, High }

    struct Strategy {
        address creator;      // Strategy owner/creator
        string title;         // Short title for feed
        string uri;           // Off-chain JSON (video, description, assets)
        address token;        // Underlying token/market (e.g., ERC20 address)
        RiskLevel risk;       // Low/Medium/High
        uint128 entryMinUsd;  // Min entry price in USD with 6 decimals (1e6 = $1.000000)
        uint128 entryMaxUsd;  // Max entry price in USD with 6 decimals
        uint16 stopLossBps;   // Stop loss in basis points, e.g., 150 = 1.50%
        uint64 createdAt;     // Timestamp
        bool active;          // Visible in feed
    }

    event StrategyCreated(
        uint256 indexed id,
        address indexed creator,
        string title,
        string uri,
        address token,
        RiskLevel risk,
        uint128 entryMinUsd,
        uint128 entryMaxUsd,
        uint16 stopLossBps
    );

    event StrategyUpdatedURI(uint256 indexed id, string newUri);
    event StrategyStatusUpdated(uint256 indexed id, bool active);
    event StrategyEntryRangeUpdated(uint256 indexed id, uint128 entryMinUsd, uint128 entryMaxUsd);
    event StrategyStopLossUpdated(uint256 indexed id, uint16 stopLossBps);

    Strategy[] private _strategies; // id is array index

    modifier onlyCreator(uint256 id) {
        require(id < _strategies.length, "BAD_ID");
        require(_strategies[id].creator == msg.sender, "NOT_CREATOR");
        _;
    }

    function createStrategy(
        string calldata title,
        string calldata uri,
        address token,
        RiskLevel risk,
        uint128 entryMinUsd,
        uint128 entryMaxUsd,
        uint16 stopLossBps
    ) external returns (uint256 id) {
        require(bytes(title).length > 0, "TITLE");
        require(bytes(uri).length > 0, "URI");
        require(entryMinUsd > 0 && entryMaxUsd > 0 && entryMinUsd <= entryMaxUsd, "ENTRY_RANGE");

        _strategies.push(
            Strategy({
                creator: msg.sender,
                title: title,
                uri: uri,
                token: token,
                risk: risk,
                entryMinUsd: entryMinUsd,
                entryMaxUsd: entryMaxUsd,
                stopLossBps: stopLossBps,
                createdAt: uint64(block.timestamp),
                active: true
            })
        );

        id = _strategies.length - 1;
        emit StrategyCreated(id, msg.sender, title, uri, token, risk, entryMinUsd, entryMaxUsd, stopLossBps);
    }

    function setActive(uint256 id, bool active) external onlyCreator(id) {
        _strategies[id].active = active;
        emit StrategyStatusUpdated(id, active);
    }

    function updateURI(uint256 id, string calldata newUri) external onlyCreator(id) {
        require(bytes(newUri).length > 0, "URI");
        _strategies[id].uri = newUri;
        emit StrategyUpdatedURI(id, newUri);
    }

    function updateEntryRange(uint256 id, uint128 entryMinUsd, uint128 entryMaxUsd) external onlyCreator(id) {
        require(entryMinUsd > 0 && entryMaxUsd > 0 && entryMinUsd <= entryMaxUsd, "ENTRY_RANGE");
        _strategies[id].entryMinUsd = entryMinUsd;
        _strategies[id].entryMaxUsd = entryMaxUsd;
        emit StrategyEntryRangeUpdated(id, entryMinUsd, entryMaxUsd);
    }

    function updateStopLoss(uint256 id, uint16 stopLossBps) external onlyCreator(id) {
        _strategies[id].stopLossBps = stopLossBps;
        emit StrategyStopLossUpdated(id, stopLossBps);
    }

    // Views
    function getStrategy(uint256 id) external view returns (Strategy memory) {
        require(id < _strategies.length, "BAD_ID");
        return _strategies[id];
    }

    function totalStrategies() external view returns (uint256) {
        return _strategies.length;
    }

    function listStrategies(uint256 offset, uint256 limit) external view returns (Strategy[] memory page) {
        uint256 n = _strategies.length;
        if (offset >= n) {
            return new Strategy[](0);
        }
        uint256 end = offset + limit;
        if (end > n) end = n;
        uint256 len = end - offset;
        page = new Strategy[](len);
        for (uint256 i = 0; i < len; i++) {
            page[i] = _strategies[offset + i];
        }
    }
}


