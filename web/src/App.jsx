import React, { useEffect, useState, useRef } from 'react';
import { GitBranch, Users, Plus, Search, X } from 'lucide-react';
import Board from './Board.jsx';
import { api, setCsrf } from './api.mjs';
import { setMembers } from './model.mjs';
import { t, getLocale, setLocale, supportedLocales, languageNames, errorMessage } from './i18n.mjs';
function Language({
  value,
  onChange
}) {
  return <label className="language-control"><span>{t('Language')}</span><select aria-label={t('Language')} value={value} onChange={e => onChange(e.target.value)}>{supportedLocales.map(l => <option key={l} value={l}>{languageNames[l]}</option>)}</select></label>;
}
function Auth({
  onSession,
  locale
}) {
  const [register, setRegister] = useState(false),
    [error, setError] = useState(null),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const data = await api('/auth/' + (register ? 'register' : 'login'), {
        method: 'POST',
        body: {
          username: form.get('username'),
          password: form.get('password'),
          ...(register ? {
            display_name: form.get('display_name'),
            language: locale
          } : {})
        }
      });
      await onSession(data, true);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  return <main className="auth-page"><section className="auth-card"><span className="hero-mark"><GitBranch size={28} /></span><h1>{t('Team Todo')}</h1><div className="auth-tabs"><button className={!register ? 'active' : ''} onClick={() => {
          setRegister(false);
          setError(null);
        }}>{t('Log in')}</button><button className={register ? 'active' : ''} onClick={() => {
          setRegister(true);
          setError(null);
        }}>{t('Register')}</button></div><form onSubmit={submit}>
 <label className="field">{t('Username')}<input aria-label={t('Username')} aria-describedby={register ? 'username-hint' : undefined} name="username" autoComplete="username" required minLength={register ? 3 : 1} maxLength={32} pattern={register ? '[A-Za-z0-9][A-Za-z0-9_.\\-]{2,31}' : undefined} autoCapitalize="none" spellCheck={false} />{register && <small id="username-hint" className="input-hint">{t('Use 3–32 ASCII letters, numbers, dots, underscores or hyphens.')}</small>}</label>
 {register && <label className="field">{t('Display name')}<input name="display_name" autoComplete="nickname" required maxLength={60} /></label>}
 <label className="field">{t('Password')}<input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={register ? 8 : 1} maxLength={128} /></label>
 {error && <p className="form-error" role="alert">{errorMessage(error)}</p>}<button className="button primary full" disabled={busy}>{busy ? t('Loading…') : t(register ? 'Create account' : 'Log in')}</button></form></section></main>;
}
function Chooser({
  onOpen,
  run,
  refreshKey
}) {
  const [teams, setTeams] = useState(null),
    [result, setResult] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(null);
  const busyRef = useRef(false),
    searchCode = useRef('');
  useEffect(() => {
    let active = true,
      inFlight = false;
    async function refresh() {
      if (inFlight || busyRef.current || document.hidden) return;
      inFlight = true;
      try {
        const data = await run(() => api('/teams'));
        if (active && !busyRef.current) setTeams(data.teams);
        const code = searchCode.current;
        if (code) {
          const found = await run(() => api('/teams/search?code=' + encodeURIComponent(code)));
          if (active && !busyRef.current && searchCode.current === code) setResult(found);
        }
      } catch (e) {
        if (active && !busyRef.current) setError(e);
      } finally {
        inFlight = false;
      }
    }
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [refreshKey]);
  async function act(fn) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      await run(fn);
    } catch (e) {
      setError(e);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  return <main className="chooser" aria-label={t('Team Todo')}>
 {error && <p role="alert" className="form-error">{errorMessage(error)}</p>}
 <section className="team-section" aria-labelledby="joined-title"><div className="section-heading"><Users /><h1 id="joined-title">{t('Joined teams')}</h1></div><div className="team-grid">{teams === null ? <p role="status">{t('Loading…')}</p> : !teams.length ? <p className="muted">{t('No teams yet')}</p> : teams.map(team => <article className="team-card" key={team.id}><h2>{team.name}</h2><p>{t('{count} members', {
              count: team.member_count
            })}</p><code>{team.code}</code><button className="button primary" onClick={() => onOpen(team.id)}>{t('Open board')}</button></article>)}</div></section>
 <section className="team-section" aria-labelledby="create-title"><div className="section-heading"><Plus /><h2 id="create-title">{t('Create team')}</h2></div><form className="inline-form" onSubmit={e => {
        e.preventDefault();
        const name = new FormData(e.currentTarget).get('name');
        act(async () => {
          const data = await api('/teams', {
            method: 'POST',
            body: {
              name
            }
          });
          onOpen(data.team.id);
        });
      }}><label className="field">{t('Team name')}<input name="name" required maxLength={60} /></label><button className="button primary" disabled={busy}>{t('Create team')}</button></form></section>
 <section className="team-section" aria-labelledby="search-title"><div className="section-heading"><Search /><h2 id="search-title">{t('Find team by code')}</h2></div><form className="inline-form" onSubmit={e => {
        e.preventDefault();
        const code = new FormData(e.currentTarget).get('code').trim();
        searchCode.current = code;
        setResult(null);
        act(async () => setResult(await api('/teams/search?code=' + encodeURIComponent(code))));
      }}><label className="field">{t('Exact team code')}<input name="code" inputMode="numeric" pattern="[0-9]{10}" minLength={10} maxLength={10} required /></label><button className="button secondary" disabled={busy}>{t('Search')}</button></form>
 {result && <article className="search-result"><div><h3>{result.team.name}</h3><code>{result.team.code}</code></div>{result.application_status === 'member' ? <><span className="membership-status">{t('Joined')}</span><button className="button primary" onClick={() => onOpen(result.team.id)}>{t('Open board')}</button></> : result.application_status === 'pending' ? <span className="membership-status" role="status">{t('Pending')}</span> : <button className="button primary" disabled={busy} onClick={() => act(async () => {
          await api('/teams/' + result.team.id + '/applications', {
            method: 'POST',
            body: {}
          });
          setResult({
            ...result,
            application_status: 'pending'
          });
        })}>{t('Apply')}</button>}</article>}
 </section></main>;
}
function Confirmation({
  message,
  onConfirm,
  onClose,
  busy
}) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.showModal();
  }, []);
  return <dialog ref={ref} className="action-dialog" onCancel={onClose}><div className="dialog-body"><p className="delete-warning">{message}</p></div><footer><button className="button secondary" onClick={onClose} disabled={busy}>{t('Cancel')}</button><button className="button danger" onClick={onConfirm} disabled={busy}>{t('Confirm')}</button></footer></dialog>;
}
function Management({
  teamId,
  user,
  onClose,
  onExit,
  run
}) {
  const [data, setData] = useState(null),
    [error, setError] = useState(null),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState(null);
  const ref = useRef(null),
    managementBusy = useRef(false),
    confirmRef = useRef(null);
  confirmRef.current = confirm;
  const load = async () => setData(await api('/teams/' + teamId + '/management'));
  useEffect(() => {
    ref.current.showModal();
    let active = true,
      inFlight = false;
    async function refresh() {
      if (inFlight || managementBusy.current || confirmRef.current || document.hidden) return;
      inFlight = true;
      try {
        const next = await run(() => api('/teams/' + teamId + '/management'));
        if (active && !managementBusy.current && !confirmRef.current) setData(next);
      } catch (e) {
        if (active) setError(e);
      } finally {
        inFlight = false;
      }
    }
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [teamId]);
  async function mutate(path, body, method = 'POST', exit = false) {
    if (managementBusy.current) return;
    managementBusy.current = true;
    setBusy(true);
    setError(null);
    try {
      await run(() => api('/teams/' + teamId + path, {
        method,
        body
      }));
      setConfirm(null);
      if (exit) onExit();else await load();
    } catch (e) {
      setConfirm(null);
      setError(e);
    } finally {
      managementBusy.current = false;
      setBusy(false);
    }
  }
  const creator = data?.team.creator_id === user.id;
  return <><dialog ref={ref} className="action-dialog management-dialog" onCancel={onClose}><header><h2>{t('Team management')}</h2><button className="icon-button" aria-label={t('Close')} onClick={onClose}><X size={18} /></button></header><div className="dialog-body">{error && <p role="alert" className="form-error">{errorMessage(error)}</p>}{!data ? <p>{t('Loading…')}</p> : <><h3>{data.team.name}</h3><p className="team-code">{t('Team code')}: <code>{data.team.code}</code></p><h3>{t('Applications')}</h3>{!data.applications.length && <p className="muted">{t('No pending applications')}</p>}{data.applications.map(a => <div className="management-row" key={a.id}><div><strong>{a.display_name}</strong><small>@{a.username}</small></div><div className="row-buttons"><button className="button secondary" disabled={busy} onClick={() => mutate('/applications/' + a.id + '/decision', {
                decision: 'approve'
              })}>{t('Approve')}</button><button className="button secondary" disabled={busy} onClick={() => mutate('/applications/' + a.id + '/decision', {
                decision: 'reject'
              })}>{t('Reject')}</button></div></div>)}
 <h3>{t('Members')}</h3>{data.members.map(member => <div className="management-row" key={member.id}><div><strong>{member.name}</strong><small>@{member.username} · {t(member.id === data.team.creator_id ? 'creator' : 'member')}</small></div>{creator && member.id !== user.id && <div className="row-buttons"><button className="button secondary" disabled={busy} onClick={() => setConfirm({
                message: t('Transfer ownership to {name}?', {
                  name: member.name
                }),
                perform: () => mutate('/transfer', {
                  user_id: member.id
                })
              })}>{t('Transfer ownership')}</button><button className="button delete-action" disabled={busy} onClick={() => setConfirm({
                message: t('Remove {name} from the team?', {
                  name: member.name
                }),
                perform: () => mutate('/members/' + member.id, undefined, 'DELETE')
              })}>{t('Remove')}</button></div>}</div>)}
 <div className="team-danger-zone">{creator ? <><p className="muted">{t('Transfer ownership before leaving.')}</p><button className="button danger" disabled={busy} onClick={() => setConfirm({
                message: t('Dissolve this team and permanently delete its board?'),
                perform: () => mutate('', undefined, 'DELETE', true)
              })}>{t('Dissolve team')}</button></> : <button className="button secondary" disabled={busy} onClick={() => setConfirm({
              message: t('Leave this team?'),
              perform: () => mutate('/leave', {}, 'POST', true)
            })}>{t('Leave team')}</button>}</div></>}</div></dialog>{confirm && <Confirmation message={confirm.message} onConfirm={confirm.perform} onClose={() => setConfirm(null)} busy={busy} />}</>;
}
export default function App() {
  const [locale, updateLocale] = useState(getLocale),
    [session, setSession] = useState(undefined),
    [path, setPath] = useState(location.pathname),
    [initial, setInitial] = useState(null),
    [error, setError] = useState(null),
    [management, setManagement] = useState(false),
    [refreshKey, setRefreshKey] = useState(0);
  const explicitLanguage = useRef(false);
  const teamId = path.match(/^\/teams\/([^/]+)\/?$/)?.[1];
  function navigate(value) {
    history.pushState({}, '', value);
    setPath(value);
    setInitial(null);
    setError(null);
    setManagement(false);
    setRefreshKey(n => n + 1);
  }
  useEffect(() => {
    const pop = () => {
      setPath(location.pathname);
      setInitial(null);
      setError(null);
      setManagement(false);
    };
    addEventListener('popstate', pop);
    return () => removeEventListener('popstate', pop);
  }, []);
  async function acceptSession(data, fromAuth = false) {
    setCsrf(data.csrf);
    if (fromAuth && explicitLanguage.current && data.user.language !== getLocale()) {
      data = await api('/auth/profile', {
        method: 'PATCH',
        body: {
          language: getLocale()
        }
      });
    } else {
      updateLocale(setLocale(data.user.language));
    }
    setSession(data);
    explicitLanguage.current = false;
  }
  useEffect(() => {
    api('/auth/session').then(data => acceptSession(data)).catch(e => {
      setSession(null);
      if (e.status !== 401) setError(e);
    });
  }, []);
  async function run(fn) {
    try {
      return await fn();
    } catch (e) {
      if (e.status === 401) {
        setSession(null);
        setCsrf('');
      }
      throw e;
    }
  }
  async function changeLanguage(value) {
    if (!session) explicitLanguage.current = true;
    updateLocale(setLocale(value));
    if (session) {
      try {
        await acceptSession(await run(() => api('/auth/profile', {
          method: 'PATCH',
          body: {
            language: value
          }
        })));
        setError(null);
      } catch (e) {
        setError(e);
      }
    }
  }
  useEffect(() => {
    if (!session || !teamId) return;
    let alive = true;
    setInitial(null);
    api('/teams/' + encodeURIComponent(teamId) + '/board').then(data => {
      if (alive) {
        setMembers(data.members);
        setInitial(data);
      }
    }).catch(e => {
      if (alive) {
        if (e.status === 401) setSession(null);
        setError(e);
      }
    });
    return () => {
      alive = false;
    };
  }, [session?.user.id, teamId]);
  return <div className="portal"><header className="account-chrome"><a href="/" className="portal-brand" onClick={e => {
        e.preventDefault();
        navigate('/');
      }}><GitBranch size={19} />{t('Team Todo')}</a><div className="account-controls"><Language value={locale} onChange={changeLanguage} />{session && <><span className="account-name">{session.user.display_name}</span><button className="button secondary" onClick={async () => {
            try {
              await run(() => api('/auth/logout', {
                method: 'POST',
                body: {}
              }));
              setSession(null);
              setCsrf('');
              navigate('/');
            } catch (e) {
              setError(e);
            }
          }}>{t('Log out')}</button></>}</div></header>
 {error && <div className="global-error" role="alert">{errorMessage(error)}{session && teamId && !initial && <button className="button secondary" onClick={() => navigate('/')}>{t('Back to teams')}</button>}</div>}
 {session === undefined ? <main className="access-state" role="status">{t('Loading…')}</main> : !session ? <Auth onSession={acceptSession} locale={locale} /> : !teamId ? <Chooser onOpen={id => navigate('/teams/' + id)} run={run} refreshKey={refreshKey} /> : initial ? <Board key={teamId} initial={initial} onBack={() => navigate('/')} onManage={() => setManagement(true)} onDenied={e => {
      setInitial(null);
      setError(e);
      if (e.status === 401) setSession(null);
    }} /> : !error ? <main className="access-state" role="status">{t('Loading…')}</main> : null}
 {management && session && <Management teamId={teamId} user={session.user} run={run} onClose={() => setManagement(false)} onExit={() => navigate('/')} />}
 </div>;
}
