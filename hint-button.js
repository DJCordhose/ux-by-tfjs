import '@vaadin/vaadin-button/vaadin-button.js';

import { LitElement, html } from "lit-element";

const PRIMARY_THRESHOLD = 0.3;
const SECONDARY_THRESHOLD = 0.1;

export class HintButton extends LitElement {
    static get properties() {
        return {
            id: {type: String},
            probability: {type: Number}
        };
    }

    render() {
        let theme = 'secondary';
        if (this.probability !== -1) {
            if (this.probability <= SECONDARY_THRESHOLD) {
                theme = 'tertiary'
            }
            if (this.probability > PRIMARY_THRESHOLD) {
                theme = 'primary'
            }
        }

        return html`<vaadin-button theme='${theme}' id='${this.id}'><slot></slot></vaadin-button>`
    }
}
window.customElements.define('hint-button', HintButton)