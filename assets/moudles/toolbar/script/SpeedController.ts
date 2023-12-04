import { _decorator, Component, Label, Slider, Node, director, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SpeedController')
export class SpeedController extends Component {
    @property(Slider)
    slider: Slider | null = null;

    @property(Label)
    label: Label | null = null;

    onLoad () {
        let speed = sys.localStorage.getItem('render_speed');
        if( speed == null ) {
            speed = '1';
            sys.localStorage.setItem('render_speed', speed);
        }

        this.label!.string = speed + " 倍";
        this.slider!.progress = (Number(speed) - 1) / 9;

        this.slider!.node.on('slide', this.callback, this);
        this.callback(this.slider);
     }

     callback(slider: Slider) {
        let progress = this.slider!.progress;
        if(progress == null)
            progress = 0;

        let speed = Math.floor(progress * 9 + 1);
        this.label!.string = speed + " 倍";

        sys.localStorage.setItem('render_speed', speed.toString());

        director.emit('render_speed_change', speed);
    }
}

