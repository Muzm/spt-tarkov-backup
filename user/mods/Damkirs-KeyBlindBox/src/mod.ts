import { DependencyContainer } from "tsyringe";

import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { VFS } from "@spt-aki/utils/VFS"
import { ImporterUtil } from "@spt-aki/utils/ImporterUtil";
import { PreAkiModLoader } from "@spt-aki/PreAkiModLoader";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { IBotConfig } from "@spt-aki/models/spt/config/IBotConfig";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { StaticRouterModService } from "@spt-aki/services/mod/staticRouter/StaticRouterModService";
import { PlayerScavGenerator } from "@spt-aki/generators/PlayerScavGenerator";
import { InventoryHelper } from "@spt-aki/helpers/InventoryHelper";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";
import { IInventoryConfig } from "@spt-aki/models/spt/IInventoryConfig";

class Mod implements IPostDBLoadMod {
  mod: string;

  constructor() {
    this.mod = "Damkris-KeyBlindBox";
  }

  public postDBLoad(container: DependencyContainer): void {
    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
    const tables = databaseServer.getTables();
    const inventoryHelper = container.resolve<InventoryHelper>("InventoryHelper");
    const itemHelper = container.resolve<ItemHelper>("ItemHelper");
    const items = tables.templates.items;
    const logger = container.resolve<ILogger>("WinstonLogger");
    const vfs = container.resolve<VFS>("VFS");
    const jsonUtil = container.resolve<JsonUtil>("JsonUtil");
    const importerUtil = container.resolve<ImporterUtil>("ImporterUtil");
    const preAkiModLoader = container.resolve<PreAkiModLoader>("PreAkiModLoader");
    const configServer = container.resolve<ConfigServer>('ConfigServer');
    const locales = tables.locales;
    // const config = importerUtil.loadRecursive(`${preAkiModLoader.getModPath("Damkris-CustomScav")}config/`)

    let candyBox = jsonUtil.clone(items["63a8970d7108f713591149f5"]);
    candyBox._id = "candyBox";
    candyBox._props.BackgroundColor = "tracergreen";
    candyBox._props.Width = 1;
    candyBox._props.Height = 1;
    candyBox._props.Grids = [
      {
        "_name": "main",
        "_id": "candyBox001",
        "_parent": "candyBox",
        "_props": {
          "filters": [
            {
              "Filter": [],
              "ExcludedFilter": [
                "54009119af1c881c07000029"
              ]
            }
          ],
          "cellsH": 1,
          "cellsV": 2,
          "minCount": 1,
          "maxCount": 2,
          "maxWeight": 1,
          "isSortingTable": false
        },
        "_proto": "55d329c24bdc2d892f8b4567"
      }
    ]
    items[candyBox._id] = candyBox
    locales.global["ch"]["candyBox Name"] = "全钥匙盲盒";
    locales.global["ch"]["candyBox ShortName"] = "钥匙盲盒";
    locales.global["ch"]["candyBox Description"] = "一个包含了所有钥匙和钥匙卡的盲盒，考验人品的时候到了";
    tables.templates.handbook.Items.push(
      {
          "Id": "candyBox",
          "ParentId": "5b5f742686f774093e6cb4ff",
          "Price": 30000,
      }
    );
    tables.traders["54cb50c76803fa8b248b4571"].assort.items.push(
      {
          "_id": candyBox._id,
          "_tpl": candyBox._id,
          "parentId": "hideout",
          "slotId": "hideout",
          "upd": {
              "StackObjectsCount": 99999999,
              "UnlimitedCount": true
          }
      }
    );
    tables.traders["54cb50c76803fa8b248b4571"].assort.barter_scheme[candyBox._id] =
    [
        [{
            _tpl: "5449016a4bdc2d6f028b456f",
            count: 30000
        }]
    ]
    tables.traders["54cb50c76803fa8b248b4571"].assort.loyal_level_items[candyBox._id] = 1;

    this.randomloot(container);

    // debug
    // console.log(error);
  }

  private randomloot(container: DependencyContainer){
    const configServer = container.resolve<ConfigServer>("ConfigServer");
    const inventoryConfig = configServer.getConfig<IInventoryConfig>(ConfigTypes.INVENTORY);
    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
    const tables = databaseServer.getTables();
    const items = tables.templates.items;
    const handbook = tables.templates.handbook
    let lootpool = {
      "rewardCount": 1,
      "foundInRaid": true,
      "rewardTplPool": {}
    }

    for (let i in items){
      if (items[i]._parent === "5c99f98d86f7745c314214b3"){
        for (let h = 0; h < handbook.Items.length-1; h++){
          if (i === handbook.Items[h].Id){
          lootpool.rewardTplPool[i] = parseInt(20000000 / handbook.Items[h].Price);
          }
        }
      }
      if (items[i]._parent === "5c164d2286f774194c5e69fa"){
        handbook.Items.forEach(h => {
          if (i === h.Id) {
              lootpool.rewardTplPool[i] = parseInt(100000000 / h.Price);
          }
      });
      }
    }
		inventoryConfig["randomLootContainers"]["candyBox"] = lootpool

    console.log(inventoryConfig["randomLootContainers"]["candyBox"]);
    // console.log(error);
  }
}

module.exports = { mod: new Mod() };
