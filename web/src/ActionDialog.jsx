import { t } from "./i18n.mjs";
import React, { useEffect, useRef, useState } from 'react';
import { X, Trash2, Plus, ArrowRight, Pencil, RotateCcw } from 'lucide-react';
import { MEMBERS, subtree, projectOf } from './model.mjs';
import { IconButton, Status } from './Nodes.jsx';
export default function ActionDialog({
  modal,
  state,
  onClose,
  onSubmit
}) {
  const ref = useRef(null);
  const task = state.tasks.find(t => t.id === modal.id);
  const p = state.projects.find(p => p.id === modal.id);
  const [name, setName] = useState(modal.type === 'rename' ? p?.name || '' : '');
  const [destination, setDestination] = useState('staging');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const branch = task ? subtree(state, task.id) : [];
  const blocked = new Set(branch.map(t => t.id));
  useEffect(() => {
    ref.current.showModal();
    ref.current.querySelector('input, select')?.focus();
  }, []);
  const titles = {
    createProject: t("新建项目"),
    createTask: t("发布任务"),
    rename: t("修改项目名称"),
    move: t("移动分支"),
    delete: t("删除整个分支")
  };
  const icons = {
    createProject: Plus,
    createTask: Plus,
    rename: Pencil,
    move: ArrowRight,
    delete: Trash2
  };
  const Icon = icons[modal.type];
  const submit = async e => {
    e.preventDefault();
    if (saving) return;
    let payload = {};
    if (['createProject', 'createTask', 'rename'].includes(modal.type)) payload = {
      name: name.trim()
    };
    if (modal.type === 'move') {
      const [kind, ...parts] = destination.split(':');
      payload = {
        parent: kind === 'staging' ? null : {
          kind,
          id: parts.join(':')
        }
      };
    }
    setSaving(true);
    try {
      const result = await onSubmit(payload);
      if (result) setError(result);
    } finally {
      setSaving(false);
    }
  };
  return <dialog ref={ref} className="action-dialog" onCancel={onClose} onClick={e => {
    if (e.target === ref.current) onClose();
  }}>
    <form onSubmit={submit} aria-busy={saving} inert={saving ? true : undefined}>
      <header><h2><Icon size={20} />{titles[modal.type]}</h2><IconButton icon={X} label={t("关闭对话框")} onClick={onClose} /></header>
      <div className="dialog-body">
        {['createProject', 'createTask', 'rename'].includes(modal.type) && <label className="field">{modal.type === 'createTask' ? t("任务名称") : t("项目名称")}<input autoFocus required maxLength={modal.type === 'createTask' ? 100 : 60} value={name} onChange={e => setName(e.target.value)} placeholder={modal.type === 'createTask' ? t("例如：完成支付页面联调") : t("例如：产品新版本发布")} /></label>}
        {modal.type === 'move' && <>
          <div className="branch-summary"><strong>{task?.title}</strong><span>{t('{count} tasks', {
                count: branch.length
              })}</span></div>
          <label className="field">{t("接入位置")}<select autoFocus value={destination} onChange={e => setDestination(e.target.value)}>
            <option value="staging">{t("暂存区")}</option>
            {state.projects.map(p => <optgroup label={p.name} key={p.id}><option value={'project:' + p.id}>{p.name} · {t('Root')}</option>{state.tasks.filter(t => projectOf(state, t.id) === p.id && !blocked.has(t.id)).map(t => <option key={t.id} value={'task:' + t.id}>{t.title} · {MEMBERS.find(m => m.id === t.owner).short}</option>)}</optgroup>)}
            <optgroup label={t("暂存中的任务")}>{state.tasks.filter(t => projectOf(state, t.id) === null && !blocked.has(t.id)).map(t => <option key={t.id} value={'task:' + t.id}>{t.title}</option>)}</optgroup>
          </select></label>
        </>}
        {modal.type === 'delete' && <>
          <p className="delete-warning">{t('Permanently delete “{name}” and its {count} tasks? This cannot be undone.', {
              name: task?.title,
              count: branch.length
            })}</p>
          <div className="affected-list">{branch.map(t => <div key={t.id}><span>{t.title}</span><span>{MEMBERS.find(m => m.id === t.owner).short}</span><Status value={t.status} /></div>)}</div>
          <p className="muted">{t("需要保留的分支，请先取消并移走。")}</p>
        </>}
        
        {error && <p className="form-error" role="alert">{error}</p>}
      </div>
      <footer><button type="button" className="button secondary" onClick={onClose}>{t("取消")}</button><button type="submit" className={'button ' + (['delete', 'reset'].includes(modal.type) ? 'danger' : 'primary')}><Icon size={16} />{modal.type === 'delete' ? t('Delete {count} tasks', {
            count: branch.length
          }) : modal.type === 'move' ? t("确认移动") : t("保存")}</button></footer>
    </form>
  </dialog>;
}
