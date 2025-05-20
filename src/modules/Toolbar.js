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
    full: IconFloatFull,
    edit: IconPencil,
    width100: "100%",
    width50: "50%",
    widthPlus: "+",
    widthMinus: "−",
  };
 
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
    full: {
      apply (activeEle) {
        ImageFormatClass.add(activeEle, 'full')
      },
      isApplied (activeEle) {
        return ImageFormatClass.value(activeEle) === 'full'
      }
    },
    edit: {
      handler (evt, button, activeEle) {
        this.quill.emitter.emit('resize-edit', activeEle, this.blot)
      }
    },
    width100: {
      apply(activeEle) {
        activeEle.style.width = "100%";
      },
      isApplied(activeEle) {
        return activeEle.style.width === "100%";
      },
    },
    width50: {
      apply(activeEle) {
        activeEle.style.width = "50%";
      },
      isApplied(activeEle) {
        return activeEle.style.width === "50%";
      },
    },
    widthPlus: {
      handler(evt, button, activeEle) {
        const current = parseFloat(activeEle.style.width) || 100;
        const next = Math.min(current + 5, 100);
        activeEle.style.width = `${next}%`;
        this.requestUpdate();
        return true; // prevent toggle logic
      },
    },
    widthMinus: {
      handler(evt, button, activeEle) {
        const current = parseFloat(activeEle.style.width) || 100;
        const next = Math.max(current - 5, 5);
        activeEle.style.width = `${next}%`;
        this.requestUpdate();
        return true; // prevent toggle logic
      },
    },
  };
 
  onCreate() {
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
 
    const toolsConfig = this.options.tools;
    const buttons = [];
 
    const createRow = (toolRow) => {
      const row = document.createElement("div");
      row.className = "ql-resize-toolbar-row"; // add styling later
      toolRow.forEach((t) => {
        const tool = Tools[t] || t;
        if (tool.verify && tool.verify.call(this, this.activeEle) === false)
          return;
 
        const button = document.createElement("button");
        button.type = "button";
        button.innerHTML = (tool.icon || "") + (tool.text || "") || Icons[t];
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
 
    // Handle tools: flat array (backward compatibility) or 2D array
    if (Array.isArray(toolsConfig[0])) {
      toolsConfig.forEach(createRow);
    } else {
      createRow(toolsConfig);
    }
  }
}
