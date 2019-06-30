import { LitElement, html } from "lit-element";
import { collector } from "./Collector";
import { trainer } from "./Trainer";

const PRIMARY_THRESHOLD = 0.4;
const SECONDARY_THRESHOLD = 0.2;

export class Demo extends LitElement {
    static get properties() {
        return {
            prediction: { type: Array },
            help: { type: Array }
        };
    }

    constructor() {
        super();
        this.prediction = [0.33, 0.33, 0.33]
        this.probas = {'download-model': 0.5, 'load-local-model': 0.5,
        'reset-data': 0.5, 'reset-model': 0.5, 'save-model-to-local': 0.5, 'show-eval': 0.5,
        'show-model': 0.5, 'toggle-prediction': 0.5, 'toggle-visor': 0.5, 'train-model': 0.5,
        'upload-model': 0.5};
    }

    // TODO: not sure if this should rather be a component (if this breaks performance of change detection)
    createHintButton(id, text, listener, record=true) {
        const proba = this.probas[id] || 0.5;
        const clickListener = record ? (e) => collector.recordClick(e) && listener(e) : listener;
        return html`<hint-button
        id="${id}"
        probability=${proba}
        @click=${clickListener}
        >${text}</hint-button>`;
    }

    render() {
        const [b1, b2, b3] = this.prediction;

        let [theme1, theme2, theme3] = ['secondary', 'secondary', 'secondary']
        if (b1 >= PRIMARY_THRESHOLD) theme1 = 'primary';
        if (b2 >= PRIMARY_THRESHOLD) theme2 = 'primary';
        if (b3 >= PRIMARY_THRESHOLD) theme3 = 'primary';
        if (b1 <= SECONDARY_THRESHOLD) theme1 = 'tertiary';
        if (b2 <= SECONDARY_THRESHOLD) theme2 = 'tertiary';
        if (b3 <= SECONDARY_THRESHOLD) theme3 = 'tertiary';

        // console.log([b1, b2, b3])
        // console.log([theme1, theme2, theme3])

        return html`
        <div style="text-align:center">
        <br>
        <br>
        <vaadin-button id='b1' theme='${theme1}'
        @mouseover=${e => collector.mouseEnter(e)}
        @mouseout=${e => collector.mouseExit(e)}
        >Left Button</vaadin-button>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp</span>
    <vaadin-button id='b2' theme='${theme2}'
        @mouseover=${e => collector.mouseEnter(e)}
        @mouseout=${e => collector.mouseExit(e)}
        >Middle Button</vaadin-button>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp</span>
    <vaadin-button id='b3' theme='${theme3}'
        @mouseover=${e => collector.mouseEnter(e)}
        @mouseout=${e => collector.mouseExit(e)}
    >Right Button</vaadin-button>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>

        ${this.createHintButton('toggle-visor', 'Toggle Visor', e => trainer.showVisor())}
        ${this.createHintButton('show-model', 'Show Model', e => trainer.showModel())}
        ${this.createHintButton('train-model', 'Train Model', e => collector.train())}
        ${this.createHintButton('show-eval', 'Show Evaluation', e => collector.evaluate())}
        ${this.createHintButton('reset-data', 'Delete Mouse Position Data', e => collector.clearMouseMovementData())}
        ${this.createHintButton('reset-click-data', 'Delete Click Data', e => collector.clearClickData())}
        <br><br>
        ${this.createHintButton('reset-model', 'Reset Model', e => trainer.init())}
        ${this.createHintButton('load-local-model', 'Load Local Model', e => trainer.load())}
        ${this.createHintButton('load-remote-model', 'Load Remote Model', e => trainer.loadRemote())}
        ${this.createHintButton('save-model-to-local', 'Save Model to Local', e => trainer.save())}
        ${this.createHintButton('download-model', 'Download Model', e => trainer.download())}
        ${this.createHintButton('upload-model', 'Upload Model', e => trainer.upload())}
        <br><br>
        ${this.createHintButton('toggle-prediction', 'Toggle Prediction', e => collector.togglePredict())}
        ${this.createHintButton('toggle-help', 'Toggle Help Mode', e => collector.toggleHelp(), false)}
        </div>
        `
    }
}
window.customElements.define('ux-demo', Demo)