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

        return html`
        <div style="text-align:center">
        <br>
        <vaadin-button
                @click=${e => collector.train()}
                >Train Model</vaadin-button>
        <vaadin-button
                @click=${e => train.toggleVisor()}
                >Toggle Visor</vaadin-button>
        <vaadin-button
                @click=${e => trainer.init()}
                >Reset Model</vaadin-button>
        <vaadin-button id='b0'
                @click=${e => trainer.load()}
                >Load Local Model</vaadin-button>
        <vaadin-button id='b0'
                @click=${e => trainer.loadRemote()}
                >Load Remote Model</vaadin-button>
        <vaadin-button
                @click=${e => trainer.save()}
                >Save Model to Local</vaadin-button>
        <vaadin-button
                @click=${e => trainer.download()}
                >Download Model</vaadin-button>
        <vaadin-button
                @click=${e => collector.togglePredict()}
                >Toggle Prediction</vaadin-button>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <vaadin-button id='b1' theme='${theme1}'
                @mouseover=${e => collector.mouseEnter(e)}
                @mouseout=${e => collector.mouseExit(e)}
                >Button #1</vaadin-button>
                <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp</span>
            <vaadin-button id='b2' theme='${theme2}'
                @mouseover=${e => collector.mouseEnter(e)}
                @mouseout=${e => collector.mouseExit(e)}
                >Button #2</vaadin-button>
                <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp</span>
            <vaadin-button id='b3' theme='${theme3}'
                @mouseover=${e => collector.mouseEnter(e)}
                @mouseout=${e => collector.mouseExit(e)}
            >Button #3</vaadin-button>
        </div>
        `
    }
}
window.customElements.define('ux-demo', Demo)