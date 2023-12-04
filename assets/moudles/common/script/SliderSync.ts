import { _decorator, Component, Node, Slider, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SliderSync')
export class SliderSync extends Component {
    @property(Slider)
    slider: Slider | null = null;

    @property(Sprite)
    sprite: Sprite | null = null;

    onLoad () {
        this.slider!.node.on('slide', this.callback, this);
        this.callback(this.slider);
     }

    start() {

    }

    update(deltaTime: number) {
        
    }

    callback(slider: Slider) {
        let progress = this.slider!.progress;
        if(progress == null)
            progress = 0;

        this.sprite!.fillRange = progress;
        
    }
}

