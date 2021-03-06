import GMButton from "../FGUI/Extends/GameLaunch/GMButton";
import MenuLayer from "../GameFrame/Menu/MenuLayer";
import GMWindow from "./GMWindow";
import GMCmdList from "./GMCmdList";
import Game from "../Game";
import GMClientHandler from "./GMClientHandler";
import { GMCmdItemData } from "./GMCmdItemData";

export default class GM
{
    static gmButton: GMButton;
    /** 初始化GM按钮 */
    static installGMButton()
    {
        let gm = this.gmButton = GMButton.createInstance();

        gm.draggable = true;
        gm.dragBounds = new Rectangle(-50, -50, Engine.stage.width + 100, Engine.stage.height + 100);
        gm.visible = true;
        window["gmButton"] = gm;

        MenuLayer.floatMsg.addChild(gm);
    }

    
    private static _window: GMWindow;
    private static get window(): GMWindow
    {
        if (!GM._window)
        {
            GM._window = new GMWindow();
        }
        return GM._window;
    }

    
    private static _visiable: boolean;
    static get visiable()
    {
        if (GM._window)
        {
            if (GM._window.parent)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        return GM._visiable;
    }

    static set visiable(value: boolean)
    {
        if (value)
        {
            GM.window.show();
        }
        else
        {
            if (GM._window)
            {
                GM.window.hide();
            }
        }
        GM._visiable = value;
    }

    static clientHandler = new GMClientHandler();


    
    private static _serverCmd: GMCmdList;
    private static _clientCmd: GMCmdList;
    private static _historCmd: GMCmdList;

    static get serverCmd():GMCmdList
    {
        if(!this._serverCmd)
        {
            this._serverCmd = new GMCmdList("ServerCmd");
        }
        return this._serverCmd;
    }

    
    static get clientCmd():GMCmdList
    {
        if(!this._clientCmd)
        {
            this._clientCmd = new GMCmdList("ClientCmd");
        }
        return this._clientCmd;
    }

    
    static get historCmd():GMCmdList
    {
        if(!this._historCmd)
        {
            this._historCmd = new GMCmdList("HistorCmd");
        }
        return this._historCmd;
    }
    


    
    static sendCmd(cmdName: string, cmdData: string | Object, isAddHostor: boolean = false)
    {
        let cmdItem: GMCmdItemData;
        if ( typeof cmdData === "string" )
        {
            cmdItem = { cnname: "", name: cmdName, data: JSON.parse(cmdData), datatxt: cmdData, isClient: false };
            cmdItem.isClient = cmdItem.data["isClient"] == true;
            cmdItem.cnname = cmdItem.data["cnname"] ? cmdItem.data["cnname"] : "";
            let cmdList = cmdItem.isClient ? GM.clientCmd : GM.serverCmd;
            let cmdSetting = cmdList.dict.getValue(cmdName);
            if (cmdSetting)
            {
                cmdItem.cnname = cmdSetting.cnname;
                cmdItem.title = cmdSetting.title;
            }
            else
            {
                cmdItem.title = cmdItem.cnname ? `${cmdItem.name} (${cmdItem.cnname})` : cmdItem.name;
            }
        }
        else
        {
            cmdItem = <GMCmdItemData>cmdData;
            if (cmdItem.isClient)
            {
                GM.clientCmd.save();
            }
            else
            {
                GM.serverCmd.save();
            }
        }



        if (isAddHostor)
        {
            GM.historCmd.add(cmdItem);
            GM.historCmd.save();
        }


        if (cmdItem.isClient)
        {
            let fun: Function = GM.clientHandler[cmdName];
            fun.apply(cmdItem.data);
        }
        else
        {
            cmdItem.cmd = `//${cmdItem.name} `;
            if(cmdItem.data)
            {
                for(let key in cmdItem.data)
                {
                    cmdItem.cmd += cmdItem.data[key] + " ";
                }
            }
            Game.sender.gm.gmCommand(cmdItem.cmd);
        }
    }

    static send(cmd: string)
    {
        Game.sender.gm.gmCommand(cmd);
    }
}

window["GM"] = GM;
window["gmSend"] = GM.send;