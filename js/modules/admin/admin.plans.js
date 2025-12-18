// =======================================================
// ADMIN PLANS MODULE
// =======================================================

const AdminPlans = {
    plans: [],
    templates: [],
    students: [],

    async init() {
        await Promise.all([this.loadPlans(), this.loadTemplates(), this.loadStudents()]);
        this.render();
    },

    async loadPlans() {
        try {
            const result = await AdminService.getPlans(true);
            if (result.success) {
                this.plans = result.data || [];
            }
        } catch (error) {
            Toast.error('Lỗi tải danh sách giáo án');
        }
    },

    async loadTemplates() {
        try {
            const result = await AdminService.getTemplates(true);
            if (result.success) {
                this.templates = result.data || [];
            }
        } catch (error) {
            Toast.error('Lỗi tải danh sách mẫu');
        }
    },

    async loadStudents() {
        try {
            console.log('AdminPlans.loadStudents() called');
            const result = await AdminService.getStudents(true);
            if (result.success) {
                this.students = result.data || [];
                console.log('AdminPlans.loadStudents() - loaded', this.students.length, 'students');
            } else {
                console.error('AdminPlans.loadStudents() - failed:', result.message);
                this.students = [];
            }
        } catch (error) {
            console.error('AdminPlans.loadStudents() - error:', error);
            Toast.error('Lỗi tải danh sách học viên');
            this.students = [];
        }
    },

    render() {
        this.renderPlans();
        this.renderTemplates();
        this.fillDropdowns();
        console.log('AdminPlans.render() - students loaded:', this.students?.length || 0);
    },

    renderPlans() {
        const container = document.getElementById('plan-list');
        const filtered = this.plans.filter(p => p.userId !== 'TEMPLATE');
        
        if (filtered.length === 0) {
            container.innerHTML = '<tr><td colspan="3" class="p-10 text-center text-slate-400">Chưa có giáo án nào.</td></tr>';
            return;
        }

        const studentsMap = {};
        this.students.forEach(s => { studentsMap[s.id] = s.name; });

        container.innerHTML = filtered.map(p => {
            // Ensure ID is a valid string - handle various cases
            let planId = '';
            if (p.id !== null && p.id !== undefined) {
                if (typeof p.id === 'string') {
                    planId = p.id.trim();
                } else if (typeof p.id === 'number') {
                    planId = String(p.id);
                } else if (typeof p.id === 'object') {
                    // If it's an object, try to get a string representation
                    console.warn('[AdminPlans] Plan ID is an object:', p.id);
                    planId = p.id.toString ? p.id.toString() : JSON.stringify(p.id);
                } else {
                    planId = String(p.id);
                }
            }
            
            // Validate planId
            if (!planId || planId === '[object Object]' || planId === 'undefined' || planId === 'null') {
                console.error('[AdminPlans] Invalid plan ID:', p.id, 'Converted:', planId);
                return ''; // Skip this row if ID is invalid
            }
            
            // Escape for HTML attribute
            const planIdEscaped = planId.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            const planName = String(p.name || '').replace(/"/g, '&quot;');
            
            return `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-3 font-bold text-blue-600">${planName}</td>
                <td class="p-3 text-xs text-slate-600">${studentsMap[p.userId] || p.userId}</td>
                <td class="p-3 text-right space-x-2">
                    <button class="text-blue-500 hover:text-blue-700 plan-edit-btn" data-plan-edit="${planIdEscaped}">
                        <i data-lucide="edit-2" class="w-4 h-4"></i>
                    </button>
                    <button onclick="AdminPlans.delete('${planIdEscaped}')" class="text-red-400 hover:text-red-600">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `;
        }).filter(html => html !== '').join(''); // Filter out empty rows
        
        // Setup event listeners for edit buttons
        container.querySelectorAll('.plan-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Get the button element (in case click is on icon inside)
                const button = e.currentTarget || e.target.closest('.plan-edit-btn');
                const planId = button ? button.getAttribute('data-plan-edit') : null;
                console.log('[AdminPlans] Edit button clicked, planId:', planId, 'Type:', typeof planId);
                if (planId) {
                    this.edit(String(planId).trim());
                } else {
                    console.error('[AdminPlans] No planId found on button');
                    Toast.error('Không tìm thấy ID giáo án');
                }
            });
        });

        lucide.createIcons();
    },

    renderTemplates() {
        const templateSelect = document.getElementById('assign-template');
        const templateList = document.getElementById('template-list-display');

        if (templateSelect) {
            templateSelect.innerHTML = '<option value="">-- Chọn Mẫu --</option>' + 
                this.templates.map(t => `<option value="${t.id}">${t.name} (${t.count} bài)</option>`).join('');
        }

        if (templateList) {
            if (this.templates.length === 0) {
                templateList.innerHTML = '<p class="text-xs text-center text-slate-400">Chưa có mẫu nào.</p>';
            } else {
                templateList.innerHTML = this.templates.map(t => {
                    // Ensure ID is a valid string - handle various cases
                    let templateId = '';
                    if (t.id !== null && t.id !== undefined) {
                        if (typeof t.id === 'string') {
                            templateId = t.id.trim();
                        } else if (typeof t.id === 'number') {
                            templateId = String(t.id);
                        } else if (typeof t.id === 'object') {
                            console.warn('[AdminPlans] Template ID is an object:', t.id);
                            templateId = t.id.toString ? t.id.toString() : JSON.stringify(t.id);
                        } else {
                            templateId = String(t.id);
                        }
                    }
                    
                    // Validate templateId
                    if (!templateId || templateId === '[object Object]' || templateId === 'undefined' || templateId === 'null') {
                        console.error('[AdminPlans] Invalid template ID:', t.id, 'Converted:', templateId);
                        return ''; // Skip this template if ID is invalid
                    }
                    
                    // Escape for HTML attribute
                    const templateIdEscaped = templateId.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                    const templateName = String(t.name || '').replace(/"/g, '&quot;');
                    
                    return `
                    <div class="flex justify-between p-2 bg-slate-50 border rounded mb-2 group hover:border-blue-200">
                        <span class="text-sm font-bold cursor-pointer hover:text-blue-600 template-edit-btn" data-plan-edit="${templateIdEscaped}">
                            ${templateName} (${t.count} bài)
                        </span>
                        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button class="p-1 bg-white border rounded hover:text-blue-600 template-edit-btn" data-plan-edit="${templateIdEscaped}">
                                <i data-lucide="edit-2" class="w-3 h-3"></i>
                            </button>
                            <button onclick="AdminPlans.delete('${templateIdEscaped}')" class="p-1 bg-white border rounded hover:text-red-600">
                                <i data-lucide="trash-2" class="w-3 h-3"></i>
                            </button>
                        </div>
                    </div>
                `;
                }).filter(html => html !== '').join(''); // Filter out empty templates
                
                // Setup event listeners for template edit buttons
                templateList.querySelectorAll('.template-edit-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Get the button element (in case click is on icon inside)
                        const button = e.currentTarget || e.target.closest('.template-edit-btn');
                        const planId = button ? button.getAttribute('data-plan-edit') : null;
                        console.log('[AdminPlans] Template edit button clicked, planId:', planId, 'Type:', typeof planId);
                        if (planId) {
                            this.edit(String(planId).trim());
                        } else {
                            console.error('[AdminPlans] No planId found on template button');
                            Toast.error('Không tìm thấy ID giáo án');
                        }
                    });
                });
            }
        }

        lucide.createIcons();
    },

    fillDropdowns() {
        console.log('AdminPlans.fillDropdowns() called, students:', this.students?.length || 0);
        
        if (!this.students || this.students.length === 0) {
            console.warn('No students available in AdminPlans.fillDropdowns()');
            // Still try to fill with empty state
            const planStudent = document.getElementById('plan-student');
            if (planStudent) planStudent.innerHTML = '<option value="">-- Chọn Học Viên --</option>';
            
            const assignStudents = document.getElementById('assign-students');
            if (assignStudents) assignStudents.innerHTML = '<option value="">Chưa có học viên</option>';
            return;
        }
        
        const optsNormal = '<option value="">-- Chọn Học Viên --</option><option value="TEMPLATE" class="font-bold text-blue-600">★ LƯU LÀM MẪU</option>' + 
            this.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        
        const planStudent = document.getElementById('plan-student');
        if (planStudent) {
            planStudent.innerHTML = optsNormal;
            console.log('Filled plan-student dropdown');
        }
        
        // Fill assign-students dropdown for "Giao Nhanh" section
        const assignStudents = document.getElementById('assign-students');
        if (assignStudents) {
            assignStudents.innerHTML = this.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            console.log('Filled assign-students dropdown with', this.students.length, 'students');
        } else {
            console.error('assign-students element not found!');
        }
        
        // Fill assign-template dropdown
        const templateSelect = document.getElementById('assign-template');
        if (templateSelect) {
            if (!this.templates || this.templates.length === 0) {
                templateSelect.innerHTML = '<option value="">Chưa có mẫu</option>';
            } else {
                templateSelect.innerHTML = '<option value="">-- Chọn Mẫu --</option>' + 
                    this.templates.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
                console.log('Filled assign-template dropdown with', this.templates.length, 'templates');
            }
        }
    },

    async edit(planId) {
        try {
            // Log the input to debug
            console.log('[AdminPlans.edit] Called with planId:', planId, 'Type:', typeof planId);
            
            // Handle if planId is an object (shouldn't happen but just in case)
            if (typeof planId === 'object' && planId !== null) {
                console.error('[AdminPlans.edit] planId is an object:', planId);
                // Try to extract from common object properties
                if (planId.id) {
                    planId = planId.id;
                } else if (planId.target) {
                    // It's an event object
                    const btn = planId.target.closest('[data-plan-edit]');
                    if (btn) {
                        planId = btn.getAttribute('data-plan-edit');
                    } else {
                        Toast.error('Không thể lấy ID giáo án từ event');
                        return;
                    }
                } else {
                    Toast.error('ID giáo án không hợp lệ (object)');
                    return;
                }
            }
            
            // Ensure planId is a string
            let actualPlanId = String(planId || '').trim();
            
            if (!actualPlanId || actualPlanId === 'undefined' || actualPlanId === 'null' || actualPlanId === '' || actualPlanId === '[object Object]') {
                console.error('[AdminPlans.edit] Invalid planId after conversion:', actualPlanId, 'Original:', planId);
                Toast.error('Không có ID giáo án hợp lệ');
                return;
            }
            
            console.log('[AdminPlans.edit] Editing plan with ID:', actualPlanId, 'Type:', typeof actualPlanId);
            Loader.show();
            
            const result = await API.getPlanDetails(actualPlanId);
            
            if (result.success) {
                const p = result.data;
                // Use the plan ID from response if available, otherwise use the actualPlanId we already processed
                const finalPlanId = String(p.id || actualPlanId).trim();
                
                console.log('[AdminPlans.edit] Loaded plan:', p.name, 'ID:', finalPlanId);
                
                document.getElementById('plan-id-edit').value = finalPlanId;
                document.getElementById('plan-name').value = p.name;
                document.getElementById('plan-student').value = p.userId;
                document.getElementById('plan-form-title').innerText = "Sửa: " + p.name;
                document.getElementById('btn-save-plan').innerText = "Cập Nhật";
                
                const tbody = document.getElementById('plan-rows');
                tbody.innerHTML = '';
                
                if (p.details && p.details.length > 0) {
                    p.details.forEach(d => {
                        tbody.insertAdjacentHTML('beforeend', `
                            <tr>
                                <td class="p-2">
                                    <select class="w-full border p-1 rounded text-sm bg-slate-50">
                                        ${['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','CN'].map(day => 
                                            `<option ${d.day === day ? 'selected' : ''}>${day}</option>`
                                        ).join('')}
                                    </select>
                                </td>
                                <td class="p-2">
                                    <input list="dl-exercises" value="${(d.exercise || '').replace(/"/g, '&quot;')}" class="w-full border p-1 rounded text-sm font-bold">
                                </td>
                                <td class="p-2">
                                    <input type="number" value="${d.sets || ''}" class="w-full border p-1 rounded text-sm text-center">
                                </td>
                                <td class="p-2">
                                    <input type="number" value="${d.reps || ''}" class="w-full border p-1 rounded text-center">
                                </td>
                                <td class="p-2">
                                    <input type="text" value="${(d.note || '').replace(/"/g, '&quot;')}" class="w-full border p-1 rounded text-sm">
                                </td>
                                <td class="p-2">
                                    <button onclick="this.closest('tr').remove()">
                                        <i data-lucide="trash-2" class="text-red-400 w-4"></i>
                                    </button>
                                </td>
                            </tr>
                        `);
                    });
                } else {
                    // Add one empty row if no details
                    this.addRow();
                }
                
                lucide.createIcons();
                
                // Switch to builder tab
                const builderBtn = document.querySelectorAll('.tab-btn')[1];
                if (builderBtn) builderBtn.click();
                
                document.getElementById('plan-editor').scrollIntoView({ behavior: 'smooth' });
            } else {
                console.error('[AdminPlans.edit] Failed to load plan:', result.message);
                Toast.error(result.message || 'Lỗi tải giáo án');
            }
        } catch (error) {
            console.error('[AdminPlans.edit] Error:', error);
            Toast.error('Lỗi: ' + (error.message || 'Không thể tải giáo án'));
        } finally {
            Loader.hide();
        }
    },

    resetForm() {
        document.getElementById('plan-id-edit').value = "";
        document.getElementById('plan-name').value = "";
        document.getElementById('plan-rows').innerHTML = "";
        document.getElementById('plan-form-title').innerText = "Tạo Giáo Án Mới";
        document.getElementById('btn-save-plan').innerText = "Lưu & Gửi";
        this.addRow();
    },

    addRow() {
        document.getElementById('plan-rows').insertAdjacentHTML('beforeend', `
            <tr>
                <td class="p-2">
                    <select class="w-full border p-1 rounded text-sm bg-slate-50">
                        <option>Thứ 2</option><option>Thứ 3</option><option>Thứ 4</option>
                        <option>Thứ 5</option><option>Thứ 6</option><option>Thứ 7</option>
                    </select>
                </td>
                <td class="p-2">
                    <input list="dl-exercises" class="w-full border p-1 rounded text-sm font-bold" placeholder="Tên bài...">
                </td>
                <td class="p-2">
                    <input type="number" value="3" class="w-full border p-1 rounded text-center">
                </td>
                <td class="p-2">
                    <input type="number" value="10" class="w-full border p-1 rounded text-center">
                </td>
                <td class="p-2">
                    <input class="w-full border p-1 rounded">
                </td>
                <td class="p-2">
                    <button onclick="this.closest('tr').remove()">
                        <i data-lucide="trash-2" class="text-red-400 w-4"></i>
                    </button>
                </td>
            </tr>
        `);
        lucide.createIcons();
    },

    async save() {
        const id = document.getElementById('plan-id-edit').value;
        const name = document.getElementById('plan-name').value;
        const uId = document.getElementById('plan-student').value;
        
        if (!name || !uId) {
            Toast.error("Thiếu thông tin!");
            return;
        }
        
        const details = Array.from(document.querySelectorAll('#plan-rows tr')).map(r => {
            const inp = r.querySelectorAll('input, select');
            return {
                day: inp[0].value,
                exercise: inp[1].value,
                sets: inp[2].value,
                reps: inp[3].value,
                note: inp[4] ? inp[4].value : '',
                video: ''
            };
        }).filter(d => d.exercise.trim() !== "");

        try {
            Loader.show();
            const result = await AdminService.savePlan({ 
                planId: id || undefined, 
                planName: name, 
                targetUser: uId, 
                details 
            });
            
            if (result.success) {
                Toast.success("Đã lưu");
                await this.init();
                this.resetForm();
            } else {
                Toast.error(result.message || 'Lỗi lưu giáo án');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    async assignTemplate() {
        const tId = document.getElementById('assign-template').value;
        const sSelect = document.getElementById('assign-students');
        const sIds = Array.from(sSelect.selectedOptions).map(o => o.value);
        const newName = document.getElementById('assign-new-name').value;
        
        if (!tId || sIds.length === 0) {
            Toast.error("Chọn đủ thông tin");
            return;
        }

        try {
            Loader.show();
            const result = await AdminService.assignTemplate({ 
                templateId: tId, 
                studentIds: sIds, 
                newName 
            });
            
            if (result.success) {
                Toast.success(result.message || "Đã giao giáo án");
                await this.init();
            } else {
                Toast.error(result.message || 'Lỗi giao giáo án');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    async delete(planId) {
        if (!confirm("Xóa?")) return;

        try {
            // Optimistic UI
            this.plans = this.plans.filter(x => x.id !== planId);
            this.templates = this.templates.filter(x => x.id !== planId);
            this.render();

            Loader.show();
            const result = await API.call('adminDeletePlan', { id: planId });
            
            if (result.success) {
                Toast.success("Đã xóa");
                await this.init();
            } else {
                Toast.error(result.message || 'Lỗi xóa');
                await this.init(); // Reload on error
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
            await this.init(); // Reload on error
        } finally {
            Loader.hide();
        }
    }
};

window.AdminPlans = AdminPlans;

