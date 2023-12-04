import { _decorator, Button, Component, director, Node } from 'cc';
import { ButtonController, ButtonStatus } from '../../common/script/ButtonController';
const { ccclass, property } = _decorator;

@ccclass('ToolbarController')
export class ToolbarController extends Component {

    @property({type: Button})
    public linkPlayButton: Button;

    @property({type: Button})
    public linkStopButton: Button;

    @property({type: ButtonController})
    public refreshButton: ButtonController;

    @property({type: ButtonController})
    public playButton: ButtonController;

    @property({type: ButtonController})
    public stopButton: ButtonController;

    protected onLoad(): void {
        director.on('render_play_end', this._onPlayEnd, this);
        director.on('render_link_hide', this.onLinkHide, this);
    }

    protected onDestroy(): void {
        director.off('render_play_end', this._onPlayEnd, this);
        director.off('render_link_hide', this.onLinkHide, this);
    }

    protected onEnable(): void {
        this.refreshButtonStatus(false);
        this.refreshLinkButton(false);
    }

    onClickSave() {
        director.emit('render_save');
    }

    onClickDetail() {
        director.emit('plan_detail_show');
    }

    onClickLinkPlay() {
        director.emit('render_link_play');
        this.refreshLinkButton(true);
    }

    onClickLinkStop() {
        director.emit('render_link_stop');
        this.refreshLinkButton(false);
    }

    onClickDetection() {
        director.emit('plan_detection_show');
    }

    onLinkHide() {
        this.refreshLinkButton(false);
    }

    onClickPlay() {
        director.emit('plan_play_start');
        this.refreshButtonStatus(true);
    }

    onClickRefresh() {
        director.emit('plan_play_refresh');
    }

    onClickStop() {
        director.emit('plan_play_stop');
        this.refreshButtonStatus(false);
    }
    
    private _onPlayEnd() {
        this.refreshButtonStatus(false);
    }

    /**
     * 是否是否播放中进行设定
     * @param playing 
     */
    private refreshButtonStatus(playing) {
        this.playButton.changeStatus(playing ? ButtonStatus.Press : ButtonStatus.Normal);
        this.refreshButton.changeStatus(playing ? ButtonStatus.Normal : ButtonStatus.Disable);
        this.stopButton.changeStatus(playing ? ButtonStatus.Normal : ButtonStatus.Disable);
    }

    private refreshLinkButton(linkPlay) {
        this.linkPlayButton.interactable = !linkPlay;
        this.linkStopButton.interactable = linkPlay;
    }
}

