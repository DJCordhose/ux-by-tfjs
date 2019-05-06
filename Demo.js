import { LitElement, html } from "lit-element";
import { collector } from "./Collector";
import { trainer } from "./Trainer";

const PRIMARY_THRESHOLD = 0.5;
const SECONDARY_THRESHOLD = 0.3;

export class Demo extends LitElement {
    static get properties() {
        return {
            prediction: { type: Array }
        };
    }

    constructor() {
        super();
        this.prediction = [0.33, 0.33, 0.33]
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

        <vaadin-button
                id='toggle-visor'
                @click=${e => collector.recordClick(e) && trainer.showVisor()}
                >Toggle Visor</vaadin-button>
        <vaadin-button
                id='show-model'
                @click=${e => collector.recordClick(e) && trainer.showModel()}
                >Show Model</vaadin-button>
        <vaadin-button
                id='train-model'
                @click=${e => collector.recordClick(e) && collector.train()}
                >Train Model</vaadin-button>
        <vaadin-button
                id='show-eval'
                @click=${e => collector.recordClick(e) && collector.evaluate()}
                >Show Evaluation</vaadin-button>
        <vaadin-button
                id='reset-data'
                @click=${e => collector.recordClick(e) && collector.clearMouseMovementData()}
            >Delete Training Data</vaadin-button>
        <br><br>
        <vaadin-button
                id='reset-model'
                @click=${e => collector.recordClick(e) && trainer.init()}
                >Reset Model</vaadin-button>
        <vaadin-button 
                id='load-local-model'
                @click=${e => collector.recordClick(e) && trainer.load()}
                >Load Local Model</vaadin-button>
        <vaadin-button 
                id="load-remote-model"
                @click=${e => collector.recordClick(e) && trainer.loadRemote()}
                >Load Remote Model</vaadin-button>
        <vaadin-button
                id="save-model-to-local"
                @click=${e => collector.recordClick(e) && trainer.save()}
                >Save Model to Local</vaadin-button>
        <vaadin-button
                id="download-model"
                @click=${e => collector.recordClick(e) && trainer.download()}
                >Download Model</vaadin-button>
        <vaadin-button
                id="upload-model"
                @click=${e => collector.recordClick(e) && trainer.upload()}
                >Upload Model</vaadin-button>
        <br><br>
        <vaadin-button
                id="toggle-prediction"
                @click=${e => collector.recordClick(e) && collector.togglePredict()}
                >Toggle Prediction</vaadin-button>
        </div>
        `
    }
}
window.customElements.define('ux-demo', Demo)