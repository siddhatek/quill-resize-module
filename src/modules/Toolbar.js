import BaseModule from './BaseModule'

import IconAlignLeft from 'quill/assets/icons/float-left.svg?raw'
import IconAlignCenter from 'quill/assets/icons/float-center.svg?raw'
import IconAlignRight from 'quill/assets/icons/float-right.svg?raw'
import IconFloatFull from 'quill/assets/icons/float-full.svg?raw'
import IconPencil from '../assets/pencil.svg?raw'

import _Quill from 'quill'
const Quill = window.Quill || _Quill

const Parchment = Quill.import('parchment')

// Quill.js 2.x support
const ClassAttributor = Parchment.ClassAttributor
  ? Parchment.ClassAttributor
  : Parchment.Attributor.Class
const ImageFormatClass = new ClassAttributor('imagestyle', 'ql-resize-style')

export default class Toolbar extends BaseModule {
  static Icons = {
    left: IconAlignLeft,
    center: IconAlignCenter,
    right: IconAlignRight,
    width100: '100%',
    width50: '50%',
    widthPlus: '+',
    widthMinus: '−'
  }

  static Tooltips = {
    left: 'Align Left',
    center: 'Align Center',
    right: 'Align Right',
    width100: 'Set Width to 100%',
    width50: 'Set Width to 50%',
    widthControls: 'Increase or Decrease Width'
  }

  static Tools = {
    left: {
      apply (activeEle) {
        ImageFormatClass.add(activeEle, 'left')
      },
      isApplied (activeEle) {
        return ImageFormatClass.value(activeEle) === 'left'
      }
    },
    center: {
      apply (activeEle) {
        ImageFormatClass.add(activeEle, 'center')
      },
      isApplied (activeEle) {
        return ImageFormatClass.value(activeEle) === 'center'
      }
    },
    right: {
      apply (activeEle) {
        ImageFormatClass.add(activeEle, 'right')
      },
      isApplied (activeEle) {
        return ImageFormatClass.value(activeEle) === 'right'
      }
    },
    width100: {
      apply(activeEle) {
        activeEle.style.width = '100%';
      },
      isApplied(activeEle) {
        return activeEle.style.width === '100%';
      },
    },
    width50: {
      apply(activeEle) {
        activeEle.style.width = '50%';
      },
      isApplied(activeEle) {
        return activeEle.style.width === '50%';
      },
    },
    widthControls: {
      icon: '<div class="width-controls"><span class="plus">+</span><span class="divider"></span><span class="minus">−</span></div>',
      handler(evt, button, activeEle) {
        // Determine which control was clicked (plus or minus)
        if (
          evt.target.classList.contains('plus') ||
          evt.target.parentElement.classList.contains('plus')
        ) {
          const parent = activeEle.parentElement;
          const parentWidth = parent.offsetWidth;

          // Get computed width in pixels
          const computedWidth = parseFloat(getComputedStyle(activeEle).width);
          const currentPercent = (computedWidth / parentWidth) * 100;

          const next = Math.min(currentPercent + 5, 100);
          activeEle.style.width = `${next}%`;
        } else if (
          evt.target.classList.contains('minus') ||
          evt.target.parentElement.classList.contains('minus')
        ) {
          const parent = activeEle.parentElement;
          const parentWidth = parent.offsetWidth;

          // Get computed width in pixels
          const computedWidth = parseFloat(getComputedStyle(activeEle).width);
          const currentPercent = (computedWidth / parentWidth) * 100;

          const next = Math.max(currentPercent - 5, 5);
          activeEle.style.width = `${next}%`;
        }

        this.requestUpdate();
        return true; // prevent toggle logic
      },
    }
  }

  onCreate () {
    // Setup Toolbar
    this.toolbar = document.createElement('div')
    this.toolbar.className = 'ql-resize-toolbar'
    this.overlay.appendChild(this.toolbar)

    // Setup Buttons
    this._addToolbarButtons()
  }

  _addToolbarButtons() {
    const Icons = this.constructor.Icons;
    const Tools = this.constructor.Tools;
    const Tooltips = this.constructor.Tooltips;

    const toolsConfig = [
      ["width100", "width50", "widthControls"],
      ["left", "center", "right"],
    ];

    const buttons = [];

    const createRow = (toolRow) => {
      const row = document.createElement("div");
      row.className = "ql-resize-toolbar-row";
      toolRow.forEach((t) => {
        const tool = Tools[t] || t;
        if (tool.verify && tool.verify.call(this, this.activeEle) === false)
          return;

        const button = document.createElement("button");
        button.type = "button";
        button.innerHTML = (tool.icon || "") + (tool.text || "") || Icons[t];
        button.className = `toolbar-button ${t}`;

        if (Tooltips[t]) {
          button.title = Tooltips[t];
          button.setAttribute("data-tooltip", Tooltips[t]);
        }

        button.addEventListener("click", (evt) => {
          if (
            tool.handler &&
            tool.handler.call(this, evt, button, this.activeEle) !== true
          )
            return;

          buttons.forEach((button) => button.classList.remove("active"));

          if (tool.isApplied && tool.isApplied.call(this, this.activeEle)) {
            ImageFormatClass.remove(this.activeEle);
          } else {
            button.classList.add("active");
            tool.apply && tool.apply.call(this, this.activeEle);
          }

          this.requestUpdate();
        });

        if (tool.isApplied && tool.isApplied.call(this, this.activeEle)) {
          button.classList.add("active");
        }

        row.appendChild(button);
        buttons.push(button);
      });

      this.toolbar.appendChild(row);
    };

    // Create toolbar with two rows
    toolsConfig.forEach(createRow);
  }
}
