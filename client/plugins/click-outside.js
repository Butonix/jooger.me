/**
 * @desc 元素外部点击指令 参考element-ui
 * @author Jooger <iamjooger@gmail.com>
 * @date 31 Dec 2017
 * @usage
 *  v-clickoutside="handleClose"
 */

'use strict'

import Vue from 'vue'
import { on } from '@/utils'

const nodeList = []
const ctx = '@@clickoutsideCtx'

let startClick
let seed = 0

function createDocumentHandler (el, binding, vnode) {
  return function (mouseup = {}, mousedown = {}) {
    if (!vnode ||
      !vnode.context ||
      !mouseup.target ||
      !mousedown.target ||
      el.contains(mouseup.target) ||
      el.contains(mousedown.target) ||
      el === mouseup.target ||
      (vnode.context.popperElm &&
      (vnode.context.popperElm.contains(mouseup.target) ||
      vnode.context.popperElm.contains(mousedown.target)))) return

    if (binding.expression &&
      el[ctx].methodName &&
      vnode.context[el[ctx].methodName]) {
      vnode.context[el[ctx].methodName]()
    } else {
      el[ctx].bindingFn && el[ctx].bindingFn()
    }
  }
}

export default () => {
  if (process.client) {
    on(document, 'mousedown', e => (startClick = e))
    on(document, 'mouseup', e => nodeList.forEach(node => node[ctx].documentHandler(e, startClick)))

    Vue.directive('clickoutside', {
      bind (el, binding, vnode) {
        nodeList.push(el)
        const id = seed++
        el[ctx] = {
          id,
          documentHandler: createDocumentHandler(el, binding, vnode),
          methodName: binding.expression,
          bindingFn: binding.value
        }
      },
      update (el, binding, vnode) {
        el[ctx].documentHandler = createDocumentHandler(el, binding, vnode)
        el[ctx].methodName = binding.expression
        el[ctx].bindingFn = binding.value
      },
      unbind (el) {
        let len = nodeList.length
        for (let i = 0; i < len; i++) {
          if (nodeList[i][ctx].id === el[ctx].id) {
            nodeList.splice(i, 1)
            break
          }
        }
        delete el[ctx]
      }
    })
  }
}
