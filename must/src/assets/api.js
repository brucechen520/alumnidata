import { request } from '../industry/api';

function callbacks(promise, success, complete, error) {
    return promise.then(data => {
        if (success) success(data);
    }).catch(reason => {
        if (error) error(reason);
        else console.error(reason);
    }).then(() => {
        if (complete) complete();
    });
}

export const api2 = {
    API_HOST: '',
    post(url, params, success, complete, error) {
        return callbacks(request('post', url, params), success, complete, error);
    },
    get(url, params, success, complete, error) {
        return callbacks(request('get', url, { params: { ...params, v: Date.now() } }), success, complete, error);
    },
    postForm(url, params, success, complete, error) {
        return callbacks(request('post', url, params), success, complete, error);
    },
    vacance_get: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_vacancy_get.php',param, handleSuccess, handleComplete, handleError);
    },
    vacancy_insert: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_vacancy_insert.php',param, handleSuccess, handleComplete, handleError);
    },
    vacancy_update: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_vacancy_update.php',param, handleSuccess, handleComplete, handleError);
    },
    vacancy_delete: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_vacancy_delete.php',param, handleSuccess, handleComplete, handleError);
    },
    vacancy_comfirm: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_vacancy_comfirm.php',param, handleSuccess, handleComplete, handleError);
    },
    project_get: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_project_get.php',param, handleSuccess, handleComplete, handleError);
    },
    project_insert: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_project_insert.php',param, handleSuccess, handleComplete, handleError);
    },
    project_update: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_project_update.php',param, handleSuccess, handleComplete, handleError);
    },
    project_delete: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_project_delete.php',param, handleSuccess, handleComplete, handleError);
    },
    project_comfirm: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_project_comfirm.php',param, handleSuccess, handleComplete, handleError);
    },
    actionlog_get: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_actionlog_get.php',param, handleSuccess, handleComplete, handleError);
    },
    web_get: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_web_get.php',param, handleSuccess, handleComplete, handleError);
    },
    web_insert: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_web_insert.php',param, handleSuccess, handleComplete, handleError);
    },
    web_comfirm: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_web_comfirm.php',param, handleSuccess, handleComplete, handleError);
    },
    web_update: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_web_update.php',param, handleSuccess, handleComplete, handleError);
    },
    web_delete: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_web_delete.php',param, handleSuccess, handleComplete, handleError);
    },
    resume_insert: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_resume_insert.php',param, handleSuccess, handleComplete, handleError);
    },
    resume_update: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_resume_update.php',param, handleSuccess, handleComplete, handleError);
    },
    resume_get: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_resume_get.php',param, handleSuccess, handleComplete, handleError);
    },
    user_get: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_user.php',param, handleSuccess, handleComplete, handleError);
    },
    member_get: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_member_get.php',param, handleSuccess, handleComplete, handleError);
    },
    photo_update: function (param,handleSuccess, handleComplete, handleError){
        return this.postForm(this.API_HOST + '/ee/api/api_photo_update.php',param, handleSuccess, handleComplete, handleError);
    },
    product_get: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_product_get.php',param, handleSuccess, handleComplete, handleError);
    },
    product_insert: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_product_insert.php',param, handleSuccess, handleComplete, handleError);
    },
    product_update: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_product_update.php',param, handleSuccess, handleComplete, handleError);
    },
    product_delete: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_product_delete.php',param, handleSuccess, handleComplete, handleError);
    },
    product_comfirm: function (param,handleSuccess, handleComplete, handleError){
        return this.post(this.API_HOST + '/ee/api/api_product_comfirm.php',param, handleSuccess, handleComplete, handleError);
    },
    
}