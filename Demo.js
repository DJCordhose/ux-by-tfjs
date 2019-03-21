import { LitElement, html } from "lit-element";
import { collector } from "./Collector";

export class Demo extends LitElement {
    render() {
        return html`
        <div style="text-align:center">
        <br>
        <vaadin-button
                @click=${e => collector.train()}
                >Train</vaadin-button>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <vaadin-button id='b1'
                @mouseover=${e => collector.mouseEnter(e)}
                @mouseout=${e => collector.mouseExit(e)}
                >Button #1</vaadin-button>
            <vaadin-button id='b2'
                @mouseover=${e => collector.mouseEnter(e)}
                @mouseout=${e => collector.mouseExit(e)}
                >Button #2</vaadin-button>
            <vaadin-button id='b3'
                @mouseover=${e => collector.mouseEnter(e)}
                @mouseout=${e => collector.mouseExit(e)}
            >Button #3</vaadin-button>
        </div>
        `
    }
}
window.customElements.define('ux-demo', Demo)
collector.train()