import Vue from 'vue';

let host = null;
let queue = Promise.resolve();

function modalHost() {
  if (!host) {
    host = new Vue({ render: h => h('div', { style: { display: 'none' } }) });
    host.$mount();
    document.body.appendChild(host.$el);
  }
  return host;
}

function enqueue(show) {
  const result = queue.then(show);
  queue = result.catch(() => {});
  return result;
}

function content(message) {
  return modalHost().$createElement('div', {
    style: { whiteSpace: 'pre-wrap' }
  }, String(message));
}

function options(opts, confirm) {
  return {
    centered: true,
    title: opts.title || '提示',
    okTitle: opts.okText || '確定',
    cancelTitle: opts.cancelText || '取消',
    okVariant: opts.danger ? 'danger' : 'primary',
    autoFocusButton: confirm && opts.danger ? 'cancel' : 'ok'
  };
}

function show(message, opts, confirm) {
  const vm = modalHost();
  const method = confirm ? 'msgBoxConfirm' : 'msgBoxOk';
  const hidden = new Promise(resolve => vm.$once('bv::modal::hidden', resolve));
  // Enter confirms even when a dangerous action initially focuses Cancel.
  const onKeydown = event => {
    if (event.key !== 'Enter' || !event.target.closest) return;
    const modal = event.target.closest('.modal.show');
    if (!modal) return;
    const ok = modal.querySelector('.modal-footer .btn-primary, .modal-footer .btn-danger');
    if (ok) { event.preventDefault(); event.stopImmediatePropagation(); ok.click(); }
  };
  document.addEventListener('keydown', onKeydown, true);
  return Promise.resolve(vm.$bvModal[method](content(message), options(opts, confirm)))
    .then(async value => { await hidden; return value; })
    .finally(() => document.removeEventListener('keydown', onKeydown, true));
}

export const dialog = {
  alert: function(message, opts = {}) {
    return enqueue(() => show(message, opts, false).then(() => undefined));
  },
  confirm: function(message, opts = {}) {
    return enqueue(() => show(message, opts, true).then(value => value === true));
  }
};

export function install(VueConstructor) {
  VueConstructor.prototype.$dialog = dialog;
}
