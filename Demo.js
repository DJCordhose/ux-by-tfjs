import { LitElement, html } from "lit-element";
import { collector } from "./Collector";
import { trainer } from "./Trainer";

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
        if (b1 >= 0.5) theme1 = 'primary';
        if (b2 >= 0.5) theme2 = 'primary';
        if (b3 >= 0.5) theme3 = 'primary';
        if (b1 <= 0.1) theme1 = 'tertiary';
        if (b2 <= 0.1) theme2 = 'tertiary';
        if (b3 <= 0.1) theme3 = 'tertiary';

        return html`
        <div style="text-align:center">
        <br>
        <vaadin-button
                @click=${e => collector.train()}
                >Train Model</vaadin-button>
        <vaadin-button
                @click=${e => trainer.init()}
                >Reset Model</vaadin-button>
        <vaadin-button id='b0'
                @mouseover=${e => collector.mouseEnter(e)}
                @mouseout=${e => collector.mouseExit(e)}
                @click=${e => trainer.load()}
                >Load Model</vaadin-button>
        <vaadin-button
                @click=${e => trainer.save()}
                >Save Model</vaadin-button>
        <vaadin-button
                @click=${e => collector.togglePredict()}
                >Toggle Prediction</vaadin-button>
        <vaadin-button
                @click=${e => trainer.download()}
                >Download</vaadin-button>
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
                <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <vaadin-button id='b2' theme='${theme2}'
                @mouseover=${e => collector.mouseEnter(e)}
                @mouseout=${e => collector.mouseExit(e)}
                >Button #2</vaadin-button>
                <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <vaadin-button id='b3' theme='${theme3}'
                @mouseover=${e => collector.mouseEnter(e)}
                @mouseout=${e => collector.mouseExit(e)}
            >Button #3</vaadin-button>
        </div>
        `
    }
}
window.customElements.define('ux-demo', Demo)