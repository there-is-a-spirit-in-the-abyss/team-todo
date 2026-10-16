// Static interface text only. Names, task titles and descriptions are never translated.
export const supportedLocales = ['en-US', 'zh-CN', 'es', 'pt-BR', 'de'];
export const languageNames = {
  'en-US': 'English',
  'zh-CN': '简体中文',
  es: 'Español',
  'pt-BR': 'Português (Brasil)',
  de: 'Deutsch'
};
const rows = `
Team Todo|团队任务|Tareas de equipo|Tarefas da equipe|Teamaufgaben
Language|语言|Idioma|Idioma|Sprache
Log in|登录|Iniciar sesión|Entrar|Anmelden
Register|注册|Registrarse|Cadastrar|Registrieren
Username|用户名|Usuario|Usuário|Benutzername
Use 3–32 ASCII letters, numbers, dots, underscores or hyphens.|使用 3–32 个英文字母、数字、点、下划线或连字符。|Usa 3–32 letras, números, puntos, guiones bajos o guiones.|Use 3–32 letras, números, pontos, sublinhados ou hífens.|3–32 Buchstaben, Zahlen, Punkte, Unterstriche oder Bindestriche verwenden.
Password|密码|Contraseña|Senha|Passwort
Display name|显示名称|Nombre visible|Nome de exibição|Anzeigename
Create account|创建账号|Crear cuenta|Criar conta|Konto erstellen
Log out|退出登录|Cerrar sesión|Sair|Abmelden
Loading…|正在加载…|Cargando…|Carregando…|Wird geladen…
Joined teams|已加入的团队|Mis equipos|Minhas equipes|Meine Teams
No teams yet|尚未加入团队|Aún no hay equipos|Nenhuma equipe ainda|Noch keine Teams
Create team|创建团队|Crear equipo|Criar equipe|Team erstellen
Team name|团队名称|Nombre del equipo|Nome da equipe|Teamname
Find team by code|通过编号查找团队|Buscar equipo por código|Buscar equipe pelo código|Team per Code suchen
Exact team code|完整团队编号|Código exacto del equipo|Código completo da equipe|Vollständiger Teamcode
Search|查找|Buscar|Buscar|Suchen
Apply|申请加入|Solicitar ingreso|Solicitar entrada|Beitritt beantragen
Pending|待审核|Pendiente|Pendente|Ausstehend
Joined|已加入|Miembro|Membro|Mitglied
Open board|进入看板|Abrir tablero|Abrir quadro|Board öffnen
Back to teams|返回团队列表|Volver a equipos|Voltar às equipes|Zurück zu Teams
Team management|团队管理|Administrar equipo|Gerenciar equipe|Team verwalten
Team code|团队编号|Código del equipo|Código da equipe|Teamcode
Members|成员|Miembros|Membros|Mitglieder
Applications|入队申请|Solicitudes|Solicitações|Beitrittsanträge
No pending applications|暂无待审核申请|No hay solicitudes pendientes|Nenhuma solicitação pendente|Keine offenen Anträge
Approve|同意|Aprobar|Aprovar|Genehmigen
Reject|拒绝|Rechazar|Rejeitar|Ablehnen
Remove|移除|Eliminar|Remover|Entfernen
Transfer ownership|转让创建者身份|Transferir propiedad|Transferir propriedade|Eigentum übertragen
Leave team|退出团队|Salir del equipo|Sair da equipe|Team verlassen
Dissolve team|解散团队|Disolver equipo|Dissolver equipe|Team auflösen
Transfer ownership before leaving.|退出前请先将创建者身份转让给其他成员。|Transfiere la propiedad antes de salir.|Transfira a propriedade antes de sair.|Übertrage vor dem Verlassen das Eigentum.
Remove {name} from the team?|确定将 {name} 移出团队？|¿Eliminar a {name} del equipo?|Remover {name} da equipe?|{name} aus dem Team entfernen?
Transfer ownership to {name}?|确定将创建者身份转让给 {name}？|¿Transferir la propiedad a {name}?|Transferir a propriedade para {name}?|Eigentum an {name} übertragen?
Leave this team?|确定退出这个团队？|¿Salir de este equipo?|Sair desta equipe?|Dieses Team verlassen?
Dissolve this team and permanently delete its board?|确定解散这个团队并永久删除整个看板？|¿Disolver este equipo y eliminar su tablero permanentemente?|Dissolver esta equipe e excluir seu quadro permanentemente?|Dieses Team auflösen und sein Board dauerhaft löschen?
Confirm|确认|Confirmar|Confirmar|Bestätigen
Cancel|取消|Cancelar|Cancelar|Abbrechen
Close|关闭|Cerrar|Fechar|Schließen
creator|创建者|Creador|Criador|Ersteller
member|成员|Miembro|Membro|Mitglied
departed|已退出|Antiguo miembro|Ex-membro|Ausgeschieden
After {name}|在「{name}」后发布任务|Crear tarea después de {name}|Criar tarefa após {name}|Aufgabe nach {name} erstellen
Under {name}|在「{name}」下发布任务|Crear tarea en {name}|Criar tarefa em {name}|Aufgabe unter {name} erstellen
任务详情|任务详情|Detalles de tarea|Detalhes da tarefa|Aufgabendetails
关闭详情|关闭详情|Cerrar detalles|Fechar detalhes|Details schließen
发布者 · 负责人|发布者 · 负责人|Autor · Responsable|Autor · Responsável|Autor · Verantwortlich
已退群 · 群成员可维护|已离队 · 团队成员可维护|Autor ausente · Miembros pueden editar|Autor saiu · Membros podem editar|Autor ausgeschieden · Mitglieder können bearbeiten
状态|状态|Estado|Status|Status
任务状态|任务状态|Estado de tarea|Status da tarefa|Aufgabenstatus
状态已更新|状态已更新|Estado actualizado|Status atualizado|Status aktualisiert
任务已保存|任务已保存|Tarea guardada|Tarefa salva|Aufgabe gespeichert
任务名称|任务名称|Nombre de tarea|Nome da tarefa|Aufgabenname
备注|备注|Notas|Notas|Notizen
补充任务信息|补充任务信息|Añadir información|Adicionar informações|Informationen ergänzen
暂无备注|暂无备注|Sin notas|Sem notas|Keine Notizen
保存修改|保存修改|Guardar cambios|Salvar alterações|Änderungen speichern
所在项目|所在项目|Proyecto|Projeto|Projekt
暂存区|暂存区|Área provisional|Área temporária|Zwischenablage
下游任务|下游任务|Tareas descendientes|Tarefas descendentes|Untergeordnete Aufgaben
移动分支|移动分支|Mover rama|Mover ramo|Zweig verschieben
分支已移入暂存区|分支已移入暂存区|Rama movida al área provisional|Ramo movido para área temporária|Zweig in Zwischenablage verschoben
移入暂存|移入暂存|Mover al área provisional|Mover para área temporária|In Zwischenablage verschieben
删除此任务及全部后代|删除此任务及全部后代|Eliminar tarea y descendientes|Excluir tarefa e descendentes|Aufgabe und Unteraufgaben löschen
只有发布者可以发起删除|只有发布者可以发起删除|Solo el autor puede eliminar|Somente o autor pode excluir|Nur der Autor darf löschen
删除分支|删除分支|Eliminar rama|Excluir ramo|Zweig löschen
正在保存，请稍候|正在保存，请稍候|Guardando, espera|Salvando, aguarde|Wird gespeichert, bitte warten
已保存|已保存|Guardado|Salvo|Gespeichert
 · 空项目已自动删除| · 空项目已自动删除| · Proyecto vacío eliminado| · Projeto vazio removido| · Leeres Projekt entfernt
分支已删除|分支已删除|Rama eliminada|Ramo excluído|Zweig gelöscht
分支已移动|分支已移动|Rama movida|Ramo movido|Zweig verschoben
分支已重新接入|分支已重新接入|Rama conectada|Ramo conectado|Zweig neu verbunden
未接入新位置，分支已回到原处|未接入新位置，分支已回到原处|Sin destino; rama devuelta a su posición|Sem destino; ramo voltou à posição original|Kein Ziel; Zweig an ursprünglicher Position
项目树|项目树|Árbol de proyectos|Árvore de projetos|Projektbaum
保存中|保存中|Guardando|Salvando|Wird gespeichert
已连接|已连接|Conectado|Conectado|Verbunden
关闭项目列表|关闭项目列表|Cerrar proyectos|Fechar projetos|Projektliste schließen
全部项目|全部项目|Todos los proyectos|Todos os projetos|Alle Projekte
新建项目|新建项目|Nuevo proyecto|Novo projeto|Neues Projekt
项目列表|项目列表|Proyectos|Projetos|Projektliste
暂无项目|暂无项目|Sin proyectos|Nenhum projeto|Keine Projekte
项目成员|项目成员|Miembros del proyecto|Membros do projeto|Projektmitglieder
我|我|Yo|Eu|Ich
打开项目列表|打开项目列表|Abrir proyectos|Abrir projetos|Projektliste öffnen
工作空间|工作空间|Espacio de trabajo|Espaço de trabalho|Arbeitsbereich
项目|项目|Proyecto|Projeto|Projekt
暂存|暂存|Provisional|Temporário|Zwischenablage
暂存工作区|暂存工作区|Área de trabajo provisional|Área de trabalho temporária|Temporärer Arbeitsbereich
重命名当前项目|重命名当前项目|Renombrar proyecto|Renomear projeto|Projekt umbenennen
已完成|已完成|Completado|Concluído|Abgeschlossen
待完成|待完成|Pendiente|Pendente|Offen
发布任务|发布任务|Crear tarea|Criar tarefa|Aufgabe erstellen
任务树|任务树|Árbol de tareas|Árvore de tarefas|Aufgabenbaum
查找任务|查找任务|Buscar tareas|Buscar tarefas|Aufgaben suchen
查找任务或负责人|查找任务或负责人|Buscar tarea o responsable|Buscar tarefa ou responsável|Aufgabe oder Autor suchen
突出我的任务|突出我的任务|Resaltar mis tareas|Destacar minhas tarefas|Meine Aufgaben hervorheben
缩小|缩小|Alejar|Diminuir zoom|Verkleinern
放大|放大|Acercar|Aumentar zoom|Vergrößern
适应全部任务|适应全部任务|Mostrar todas las tareas|Mostrar todas as tarefas|Alle Aufgaben einpassen
聚焦项目|聚焦项目|Enfocar proyecto|Focar projeto|Projekt fokussieren
聚焦暂存区|聚焦暂存区|Enfocar área provisional|Focar área temporária|Zwischenablage fokussieren
项目视图|项目视图|Vista de proyecto|Visualização do projeto|Projektansicht
暂存视图|暂存视图|Vista provisional|Visualização temporária|Zwischenablageansicht
移入暂存区|移入暂存区|Mover al área provisional|Mover para área temporária|In Zwischenablage verschieben
修改项目名称|修改项目名称|Renombrar proyecto|Renomear projeto|Projekt umbenennen
删除整个分支|删除整个分支|Eliminar toda la rama|Excluir todo o ramo|Gesamten Zweig löschen
关闭对话框|关闭对话框|Cerrar diálogo|Fechar diálogo|Dialog schließen
项目名称|项目名称|Nombre del proyecto|Nome do projeto|Projektname
例如：完成支付页面联调|例如：完成支付页面联调|Ejemplo: integrar la página de pago|Exemplo: integrar a página de pagamento|Beispiel: Zahlungsseite integrieren
例如：产品新版本发布|例如：产品新版本发布|Ejemplo: lanzamiento de producto|Exemplo: lançamento do produto|Beispiel: Produktveröffentlichung
接入位置|接入位置|Destino|Destino|Ziel
暂存中的任务|暂存中的任务|Tareas provisionales|Tarefas temporárias|Zwischengespeicherte Aufgaben
需要保留的分支，请先取消并移走。|需要保留的分支，请先取消并移走。|Cancela y mueve las ramas que quieras conservar.|Cancele e mova os ramos que deseja manter.|Abbrechen und zu erhaltende Zweige zuerst verschieben.
确认移动|确认移动|Confirmar movimiento|Confirmar movimento|Verschieben bestätigen
保存|保存|Guardar|Salvar|Speichern
完成|完成|Completado|Concluído|Abgeschlossen
废弃|废弃|Descartado|Descartado|Verworfen
{count} tasks|{count} 个任务|{count} tareas|{count} tarefas|{count} Aufgaben
{count} members|{count} 位成员|{count} miembros|{count} membros|{count} Mitglieder
{count} mine|{count} 个由我负责|{count} a mi cargo|{count} sob minha responsabilidade|{count} von mir
{count} ended|{count} 已结束|{count} finalizadas|{count} encerradas|{count} beendet
{count} staged tasks|{count} 个暂存任务|{count} tareas provisionales|{count} tarefas temporárias|{count} zwischengespeicherte Aufgaben
Root|树根|Raíz|Raiz|Wurzel
Delete {count} tasks|确认删除 {count} 个任务|Eliminar {count} tareas|Excluir {count} tarefas|{count} Aufgaben löschen
Permanently delete “{name}” and its {count} tasks? This cannot be undone.|永久删除「{name}」及其分支中的 {count} 个任务？此操作不可撤销。|¿Eliminar “{name}” y sus {count} tareas permanentemente? No se puede deshacer.|Excluir “{name}” e suas {count} tarefas permanentemente? Não pode ser desfeito.|„{name}“ und seine {count} Aufgaben dauerhaft löschen? Dies kann nicht rückgängig gemacht werden.
Request failed. Please try again.|请求失败，请重试。|La solicitud falló. Inténtalo de nuevo.|A solicitação falhou. Tente novamente.|Anfrage fehlgeschlagen. Bitte erneut versuchen.
Invalid username or password.|用户名或密码错误。|Usuario o contraseña incorrectos.|Usuário ou senha incorretos.|Benutzername oder Passwort ungültig.
This username is already registered.|用户名已被注册。|Este usuario ya está registrado.|Este usuário já está cadastrado.|Dieser Benutzername ist bereits registriert.
Please log in again.|请重新登录。|Vuelve a iniciar sesión.|Entre novamente.|Bitte erneut anmelden.
You no longer have access to this team.|你已无法访问此团队。|Ya no tienes acceso a este equipo.|Você não tem mais acesso a esta equipe.|Du hast keinen Zugriff mehr auf dieses Team.
The board changed. Please retry your action.|看板已更新，请重试操作。|El tablero cambió. Repite la acción.|O quadro mudou. Repita a ação.|Das Board wurde geändert. Bitte erneut versuchen.
Team not found. Check the exact code.|未找到团队，请检查完整编号。|Equipo no encontrado. Revisa el código exacto.|Equipe não encontrada. Confira o código completo.|Team nicht gefunden. Bitte vollständigen Code prüfen.
This application was already reviewed.|该申请已审核。|Esta solicitud ya fue revisada.|Esta solicitação já foi analisada.|Dieser Antrag wurde bereits geprüft.
Only the team creator can do this.|只有团队创建者可以操作。|Solo el creador del equipo puede hacerlo.|Somente o criador da equipe pode fazer isso.|Nur der Teamersteller darf dies ausführen.
Too many attempts. Please wait and retry.|尝试过于频繁，请稍后重试。|Demasiados intentos. Espera y reintenta.|Muitas tentativas. Aguarde e tente novamente.|Zu viele Versuche. Bitte warten und erneut versuchen.
Invalid input. Please check your entries.|输入无效，请检查填写内容。|Datos inválidos. Revisa tus entradas.|Dados inválidos. Confira os campos.|Ungültige Eingabe. Bitte Angaben prüfen.
Security check failed. Reload and retry.|安全校验失败，请刷新后重试。|La verificación falló. Recarga y reintenta.|Falha de segurança. Recarregue e tente novamente.|Sicherheitsprüfung fehlgeschlagen. Neu laden und erneut versuchen.
Only the author can edit this task.|只有发布者可以编辑任务。|Solo el autor puede editar esta tarea.|Somente o autor pode editar esta tarefa.|Nur der Autor darf diese Aufgabe bearbeiten.
Cannot move a task into its own branch.|不能将任务移入自己的分支。|No puedes mover una tarea a su propia rama.|Não é possível mover uma tarefa para seu próprio ramo.|Eine Aufgabe kann nicht in ihren eigenen Zweig verschoben werden.
Task or project not found.|任务或项目不存在。|No se encontró la tarea o el proyecto.|Tarefa ou projeto não encontrado.|Aufgabe oder Projekt nicht gefunden.
Board limit reached.|已达到看板数量限制。|Se alcanzó el límite del tablero.|Limite do quadro atingido.|Board-Limit erreicht.
Only current task authors in this project may rename it.|只有项目内的当前任务发布者可以重命名。|Solo los autores actuales de este proyecto pueden renombrarlo.|Somente os autores atuais deste projeto podem renomeá-lo.|Nur aktuelle Aufgabenautoren dieses Projekts dürfen es umbenennen.
Notes may contain at most 2,000 characters.|备注最多为 2,000 个字符。|Las notas admiten hasta 2000 caracteres.|As notas podem ter até 2.000 caracteres.|Notizen dürfen höchstens 2.000 Zeichen enthalten.
Member not found. Refresh and retry.|成员不存在，请刷新后重试。|Miembro no encontrado. Recarga y reintenta.|Membro não encontrado. Recarregue e tente novamente.|Mitglied nicht gefunden. Neu laden und erneut versuchen.
Application not found. Refresh and retry.|申请不存在，请刷新后重试。|Solicitud no encontrada. Recarga y reintenta.|Solicitação não encontrada. Recarregue e tente novamente.|Antrag nicht gefunden. Neu laden und erneut versuchen.
You already belong to this team.|你已加入该团队。|Ya perteneces a este equipo.|Você já faz parte desta equipe.|Du gehörst diesem Team bereits an.
Choose another current member.|请选择其他当前成员。|Elige a otro miembro actual.|Escolha outro membro atual.|Bitte ein anderes aktuelles Mitglied wählen.
Request is too large.|请求内容过大。|La solicitud es demasiado grande.|A solicitação é muito grande.|Die Anfrage ist zu groß.
Page or endpoint not found.|页面或接口不存在。|Página o ruta no encontrada.|Página ou rota não encontrada.|Seite oder Endpunkt nicht gefunden.
`;
// Board source keys use the original Chinese to keep translation separate from content.
const englishBoard = {
  任务详情: 'Task details',
  关闭详情: 'Close details',
  '发布者 · 负责人': 'Author · Responsible',
  '已退群 · 群成员可维护': 'Author left · Members may edit',
  状态: 'Status',
  任务状态: 'Task status',
  状态已更新: 'Status updated',
  任务已保存: 'Task saved',
  任务名称: 'Task name',
  备注: 'Notes',
  补充任务信息: 'Add task details',
  暂无备注: 'No notes',
  保存修改: 'Save changes',
  所在项目: 'Project',
  暂存区: 'Staging',
  下游任务: 'Descendant tasks',
  移动分支: 'Move branch',
  分支已移入暂存区: 'Branch moved to staging',
  移入暂存: 'Move to staging',
  删除此任务及全部后代: 'Delete this task and all descendants',
  只有发布者可以发起删除: 'Only the author can delete',
  删除分支: 'Delete branch',
  '正在保存，请稍候': 'Saving, please wait',
  已保存: 'Saved',
  ' · 空项目已自动删除': ' · Empty project removed',
  分支已删除: 'Branch deleted',
  分支已移动: 'Branch moved',
  分支已重新接入: 'Branch reconnected',
  '未接入新位置，分支已回到原处': 'No target; branch returned to its original position',
  项目树: 'Project tree',
  保存中: 'Saving',
  已连接: 'Connected',
  关闭项目列表: 'Close project list',
  全部项目: 'All projects',
  新建项目: 'New project',
  项目列表: 'Project list',
  暂无项目: 'No projects',
  项目成员: 'Project members',
  我: 'Me',
  打开项目列表: 'Open project list',
  工作空间: 'Workspace',
  项目: 'Project',
  暂存: 'Staging',
  暂存工作区: 'Staging workspace',
  重命名当前项目: 'Rename current project',
  已完成: 'Completed',
  待完成: 'Pending',
  发布任务: 'Create task',
  任务树: 'Task tree',
  查找任务: 'Find tasks',
  查找任务或负责人: 'Find task or author',
  突出我的任务: 'Highlight my tasks',
  缩小: 'Zoom out',
  放大: 'Zoom in',
  适应全部任务: 'Fit all tasks',
  聚焦项目: 'Focus project',
  聚焦暂存区: 'Focus staging',
  项目视图: 'Project view',
  暂存视图: 'Staging view',
  移入暂存区: 'Move to staging',
  修改项目名称: 'Rename project',
  删除整个分支: 'Delete entire branch',
  关闭对话框: 'Close dialog',
  项目名称: 'Project name',
  '例如：完成支付页面联调': 'Example: integrate the payment page',
  '例如：产品新版本发布': 'Example: product release',
  接入位置: 'Destination',
  暂存中的任务: 'Staged tasks',
  '需要保留的分支，请先取消并移走。': 'Cancel and move any branches you want to keep first.',
  确认移动: 'Confirm move',
  保存: 'Save',
  完成: 'Completed',
  废弃: 'Discarded'
};
export const catalogs = Object.fromEntries(supportedLocales.map(l => [l, {}]));
for (const line of rows.trim().split('\n')) {
  const values = line.split('|'),
    key = values[0];
  supportedLocales.forEach((l, i) => catalogs[l][key] = i === 0 ? englishBoard[key] || key : values[i]);
}
for (const line of rows.trim().split('\n')) {
  const values = line.split('|'),
    key = values[0],
    zh = values[1];
  if (!catalogs['en-US'][zh]) supportedLocales.forEach(l => catalogs[l][zh] = catalogs[l][key]);
}
let locale = 'en-US';
try {
  locale = supportedLocales.includes(localStorage.getItem('team-todo-language')) ? localStorage.getItem('team-todo-language') : 'en-US';
} catch {}
export const getLocale = () => locale;
export function setLocale(value) {
  locale = supportedLocales.includes(value) ? value : 'en-US';
  try {
    localStorage.setItem('team-todo-language', locale);
  } catch {}
  if (typeof document !== 'undefined') document.documentElement.lang = locale;
  return locale;
}
export function t(key, params = {}) {
  const value = catalogs[locale][key] || catalogs['en-US'][key] || key;
  return value.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`));
}
const errors = {
  invalid_credentials: 'Invalid username or password.',
  username_taken: 'This username is already registered.',
  username_exists: 'This username is already registered.',
  unauthenticated: 'Please log in again.',
  authentication_required: 'Please log in again.',
  session_expired: 'Please log in again.',
  not_a_member: 'You no longer have access to this team.',
  membership_required: 'You no longer have access to this team.',
  revision_conflict: 'The board changed. Please retry your action.',
  stale_revision: 'The board changed. Please retry your action.',
  team_not_found: 'Team not found. Check the exact code.',
  application_decided: 'This application was already reviewed.',
  already_decided: 'This application was already reviewed.',
  creator_required: 'Only the team creator can do this.',
  creator_only: 'Only the team creator can do this.',
  creator_must_transfer: 'Transfer ownership before leaving.',
  rate_limited: 'Too many attempts. Please wait and retry.',
  invalid_input: 'Invalid input. Please check your entries.',
  validation_error: 'Invalid input. Please check your entries.',
  csrf_failed: 'Security check failed. Reload and retry.',
  invalid_csrf: 'Security check failed. Reload and retry.',
  invalid_origin: 'Security check failed. Reload and retry.',
  author_required: 'Only the author can edit this task.',
  cycle: 'Cannot move a task into its own branch.',
  task_not_found: 'Task or project not found.',
  project_not_found: 'Task or project not found.',
  board_limit: 'Board limit reached.'
};
Object.assign(errors, {
  auth_required: 'Please log in again.',
  csrf_invalid: 'Security check failed. Reload and retry.',
  origin_invalid: 'Security check failed. Reload and retry.',
  not_member: 'You no longer have access to this team.',
  board_conflict: 'The board changed. Please retry your action.',
  task_forbidden: 'Only the author can edit this task.',
  project_rename_forbidden: 'Only current task authors in this project may rename it.',
  cycle_forbidden: 'Cannot move a task into its own branch.',
  description_too_long: 'Notes may contain at most 2,000 characters.',
  invalid_action: 'Invalid input. Please check your entries.',
  invalid_transfer: 'Choose another current member.',
  member_not_found: 'Member not found. Refresh and retry.',
  application_not_found: 'Application not found. Refresh and retry.',
  already_member: 'You already belong to this team.',
  try_again: 'Request failed. Please try again.',
  request_too_large: 'Request is too large.',
  not_found: 'Page or endpoint not found.',
  request_failed: 'Request failed. Please try again.'
});
errors.frontend_unbuilt = 'Request failed. Please try again.';
export function errorMessage(error) {
  return errors[error?.code] ? t(errors[error.code]) : error?.detail || error?.message || t('Request failed. Please try again.');
}
setLocale(locale);
