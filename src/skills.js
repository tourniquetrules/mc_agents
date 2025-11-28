// skills.js located in ./

const { come } = require('./skills/come.js');
const { queryInventory } = require('./skills/queryInventory.js');
const { storeInventory } = require('./skills/storeInventory.js');
const { harvestTree } = require('./skills/harvestTree.js');
const { craftCraftingTable } = require('./skills/craftCraftingTable.js');
const { placeBlock } = require('./skills/placeBlock.js');
const { craftChest } = require('./skills/craftChest.js');
const { follow } = require('./skills/follow.js');
const { stop } = require('./skills/stop.js');
const { hunt } = require('./skills/hunt.js');
const { retrieveFromChest } = require('./skills/retrieveFromChest.js');
const { craftItem } = require('./skills/craftItem.js');
const { equipItem } = require('./skills/equipItem.js');
const { mineBlock } = require('./skills/mineBlock.js');
const { giveItem } = require('./skills/giveItem.js');
const { move } = require('./skills/move.js');
const { lookAt } = require('./skills/lookAt.js');
const { fight } = require('./skills/fight.js');
const { eat } = require('./skills/eat.js');
const { status } = require('./skills/status.js');
const { locateBlock } = require('./skills/locateBlock.js');
const { guard } = require('./skills/guard.js');

const skillFunctions = {
    come,
    queryInventory,
    storeInventory,
    harvestTree,
    craftCraftingTable,
    placeBlock,
    craftChest,
    follow,
    stop,
    hunt,
    retrieveFromChest,
    craftItem,
    equipItem,
    mineBlock,
    giveItem,
    move,
    lookAt,
    fight,
    eat,
    status,
    locateBlock,
    guard
};

module.exports = {
    skillFunctions
};
