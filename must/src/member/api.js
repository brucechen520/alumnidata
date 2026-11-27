import { http, ready } from '../shared/http';

// 未登入或停權（401）時回到登入頁，與舊 main.php 的導向相同
http.interceptors.response.use(r => r, error => {
  const response = error.response;
  if (response && response.status === 401) {
    location.href = '/ee/Frontend/login.html';
    return new Promise(() => {});
  }
  return Promise.reject(error);
});

export { ready };

export const memberApi = {
  shell: () => http.get('api_mem_shell.php'),
  messages: () => http.get('api_mem_messages.php'),
  message: id => http.get('api_mem_messages.php', { params: { id } }),
  deleteMessage: id => http.post('api_mem_message_delete.php', { id }),
  basic: () => http.get('api_mem_basic.php'),
  saveBasic: data => http.post('api_mem_basic.php', data),
  advanced: () => http.get('api_mem_advanced.php'),
  saveAdvanced: data => http.post('api_mem_advanced.php', data),
  experience: () => http.get('api_mem_experience.php'),
  saveExperience: data => http.post('api_mem_experience.php', data),
  directory: t => http.get('api_mem_directory.php', { params: { t } }),
  profile: id => http.get('api_mem_profile.php', { params: { id } }),
  statistics: t => http.get('api_mem_statistics.php', { params: { t } }),
  mdcard: () => http.get('api_mem_mdcard.php'),
  mdcardAction: payload => http.post('api_mem_mdcard.php', payload)
};

// 後台管理（issue 006）：全部需管理員，寫入帶 CSRF（http 層自動帶 X-XSRF-TOKEN）
export const adminApi = {
  mailSingle: formData => http.post('api_admin_mail_single.php', formData),
  mailRecipients: sort => http.get('api_admin_mail.php', { params: sort ? { sort } : {} }),
  mailSend: formData => http.post('api_admin_mail.php', formData, { timeout: 0 }),
  mailJob: jobId => http.get('api_admin_mail.php', { params: { jobId } }),
  // 寄信功能（非同步群發，issue 016）
  mailJobRecipients: sort => http.get('api_admin_mail_jobs.php', { params: sort ? { action: 'recipients', sort } : { action: 'recipients' } }),
  mailJobs: () => http.get('api_admin_mail_jobs.php', { params: { jobs: 1 } }),
  mailJobDetail: job => http.get('api_admin_mail_jobs.php', { params: { job } }),
  mailJobCreate: formData => http.post('api_admin_mail_jobs.php', formData),
  mailJobAction: (action, jobKey) => http.post('api_admin_mail_jobs.php', { action, jobKey }),
  mailTemplates: () => http.get('api_admin_mail_templates.php'),
  mailTemplate: id => http.get('api_admin_mail_templates.php', { params: { id } }),
  mailTemplateSave: formData => http.post('api_admin_mail_templates.php', formData),
  mailTemplateDelete: id => http.post('api_admin_mail_templates.php', { action: 'delete', id }),
  postMessage: (topic, content) => http.post('api_admin_messages.php', { topic, content }),
  members: sort => http.get('api_admin_members.php', { params: sort ? { sort } : {} }),
  setConfirm: changes => http.post('api_admin_members.php', { changes }),
  marquee: () => http.get('api_admin_marquee.php'),
  setMarquee: marquee => http.post('api_admin_marquee.php', { marquee }),
  changeLog: () => http.get('api_admin_changelog.php'),
  files: () => http.get('api_admin_files.php'),
  uploadFile: formData => http.post('api_admin_files.php', formData),
  sqlCheck: t => http.get('api_admin_sqlcheck.php', { params: { t } })
};
