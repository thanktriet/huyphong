// =======================================================
// ADMIN STUDENTS MODULE
// =======================================================

const AdminStudents = {
    students: [],

    async init() {
        await this.load();
        this.render();
        
        // Re-render on window resize to switch between mobile/desktop layouts
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.render();
            }, 250);
        });
    },

    async load(useCache = true) {
        try {
            // If not using cache, clear it first to ensure fresh data
            if (!useCache && typeof Utils !== 'undefined' && Utils.cache) {
                Utils.cache.clear('students');
            }
            
            console.log('[AdminStudents] Loading students... (useCache:', useCache, ')');
            const result = await AdminService.getStudents(useCache);
            console.log('[AdminStudents] Load result:', result);
            if (result.success) {
                this.students = result.data || [];
                console.log('[AdminStudents] Loaded', this.students.length, 'students');
            } else {
                console.error('[AdminStudents] Load failed:', result.message);
                Toast.error('Lỗi tải danh sách học viên: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('[AdminStudents] Load error:', error);
            Toast.error('Lỗi tải danh sách học viên: ' + error.message);
        }
    },

    async refresh(delay = 200) {
        // Clear all related caches FIRST, before any delay
        if (typeof Utils !== 'undefined' && Utils.cache) {
            Utils.cache.clear('students');
            Utils.cache.clear('dashboard_stats'); // Also clear dashboard cache
            console.log('[AdminStudents] Cache cleared');
        }
        
        // Small delay to ensure Supabase has committed the changes
        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        // Load without cache - force fresh data
        await this.load(false); // Load without cache
        this.render();
        
        console.log('[AdminStudents] Refresh completed');
    },

    render() {
        const isMobile = window.innerWidth < 768;
        const mobileContainer = document.getElementById('student-list-mobile');
        const desktopContainer = document.getElementById('student-list');
        const viewSection = document.getElementById('view-students');
        
        console.log('[AdminStudents] Rendering students. Count:', this.students?.length || 0, 
            'isMobile:', isMobile,
            'mobileContainer:', !!mobileContainer,
            'desktopContainer:', !!desktopContainer,
            'viewSection hidden:', viewSection?.classList.contains('hidden'));
        
        // Ensure view section is visible temporarily if needed for container access
        const wasHidden = viewSection?.classList.contains('hidden');
        if (wasHidden && (!mobileContainer || !desktopContainer)) {
            viewSection?.classList.remove('hidden');
            // Re-query containers after making section visible
            const mobileContainerRetry = document.getElementById('student-list-mobile');
            const desktopContainerRetry = document.getElementById('student-list');
            
            // Render to both containers to ensure data is available when switching between mobile/desktop
            if (mobileContainerRetry) {
                this.renderToContainer(mobileContainerRetry, true);
            }
            if (desktopContainerRetry) {
                this.renderToContainer(desktopContainerRetry, false);
            }
            
            // Hide section again if it was hidden
            viewSection?.classList.add('hidden');
        } else {
            // Render to both containers to ensure data is available when switching between mobile/desktop
            if (mobileContainer) {
                this.renderToContainer(mobileContainer, true);
            }
            if (desktopContainer) {
                this.renderToContainer(desktopContainer, false);
            }
        }
        
        if (!mobileContainer && !desktopContainer) {
            console.error('[AdminStudents] Both containers are missing!');
        }
    },
    
    renderToContainer(container, isMobile) {
        
        if (!this.students || this.students.length === 0) {
            if (isMobile || container.id === 'student-list-mobile') {
                container.innerHTML = '<div class="p-10 text-center text-slate-400">Chưa có học viên nào.</div>';
            } else {
                container.innerHTML = '<tr><td colspan="3" class="p-10 text-center text-slate-400">Chưa có học viên nào.</td></tr>';
            }
            return;
        }

        if (isMobile || container.id === 'student-list-mobile') {
            // Mobile: Card layout
            container.innerHTML = this.students.map(st => `
                <div class="student-card-mobile border-b border-slate-200 p-4 bg-white hover:bg-slate-50">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex-1">
                            <a href="profile-student.html?id=${st.id}" class="font-bold text-blue-600 hover:underline text-base block mb-1">${st.name}</a>
                            <span class="text-xs text-slate-400 block mb-1">${st.email}</span>
                            <span class="text-[10px] ${st.isExpired ? 'text-red-500' : 'text-green-600'} font-bold">
                                ${st.isExpired ? 'Hết hạn' : 'Hạn: ' + st.expiryDate}
                            </span>
                        </div>
                        <div class="text-center ml-4">
                            <div class="font-black text-xl text-blue-600">${st.sessionLeft || 0}</div>
                            <div class="text-[10px] text-slate-400 uppercase">Buổi</div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <button onclick="AdminStudents.topUp('${st.id}','${st.name}')" class="student-action-btn bg-blue-50 text-blue-600 px-3 py-2 rounded border text-xs font-bold hover:bg-blue-100 flex items-center justify-center gap-1">
                            <i data-lucide="plus-circle" class="w-3 h-3"></i> Nạp Buổi
                        </button>
                        <button onclick="AdminStudents.openExtendModal('${st.id}')" class="student-action-btn bg-green-50 text-green-600 px-3 py-2 rounded border text-xs font-bold hover:bg-green-100 flex items-center justify-center gap-1">
                            <i data-lucide="calendar-plus" class="w-3 h-3"></i> Gia Hạn
                        </button>
                        <button onclick="AdminStudents.openSetTargetCalories('${st.id}','${st.name}',${st.targetCalories || 2000})" class="student-action-btn bg-purple-50 text-purple-600 px-3 py-2 rounded border text-xs font-bold hover:bg-purple-100 flex items-center justify-center gap-1 col-span-2">
                            <i data-lucide="target" class="w-3 h-3"></i> 🎯 Đặt Mục Tiêu Calories
                        </button>
                    </div>
                    <div class="flex gap-2 justify-end pt-2 border-t border-slate-100">
                        <button onclick="AdminStudents.openEdit('${st.id}')" class="student-action-btn bg-slate-50 text-slate-600 px-3 py-2 rounded text-xs border flex items-center gap-1" title="Sửa">
                            <i data-lucide="edit-2" class="w-3 h-3"></i> Sửa
                        </button>
                        <button onclick="AdminStudents.toggleStatus('${st.id}','${st.status}')" class="student-action-btn bg-yellow-50 text-yellow-600 px-3 py-2 rounded text-xs border flex items-center gap-1" title="Khóa/Mở">
                            ${st.status === 'Active' ? '🔒' : '🔓'} ${st.status === 'Active' ? 'Khóa' : 'Mở'}
                        </button>
                        <button onclick="AdminStudents.deleteStudent('${st.id}','${st.name}')" class="student-action-btn bg-red-50 text-red-600 px-3 py-2 rounded text-xs border flex items-center gap-1" title="Xóa">
                            <i data-lucide="trash-2" class="w-3 h-3"></i> Xóa
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            // Desktop: Table layout
            container.innerHTML = this.students.map(st => `
                <tr class="hover:bg-slate-50 border-b">
                    <td class="p-4">
                        <a href="profile-student.html?id=${st.id}" class="font-bold text-blue-600 hover:underline text-lg">${st.name}</a>
                        <br><span class="text-xs text-slate-400">${st.email}</span>
                        <br><span class="text-[10px] ${st.isExpired ? 'text-red-500' : 'text-green-600'} font-bold">
                            ${st.isExpired ? 'Hết hạn' : 'Hạn: ' + st.expiryDate}
                        </span>
                    </td>
                    <td class="p-4 text-center">
                        <div class="font-black text-lg text-blue-600">${st.sessionLeft || 0}</div>
                        <div class="text-[10px] text-slate-400 uppercase">Buổi</div>
                    </td>
                    <td class="p-3 md:p-4 text-right space-y-2 student-actions-cell">
                        <div class="flex gap-1 justify-end flex-wrap">
                            <button onclick="AdminStudents.topUp('${st.id}','${st.name}')" class="student-action-btn bg-blue-50 text-blue-600 px-2 py-1 rounded border text-xs font-bold hover:bg-blue-100 whitespace-nowrap">Nạp Buổi</button>
                            <button onclick="AdminStudents.openExtendModal('${st.id}')" class="student-action-btn bg-green-50 text-green-600 px-2 py-1 rounded border text-xs font-bold hover:bg-green-100 whitespace-nowrap">Gia Hạn</button>
                            <button onclick="AdminStudents.openSetTargetCalories('${st.id}','${st.name}',${st.targetCalories || 2000})" class="student-action-btn bg-purple-50 text-purple-600 px-2 py-1 rounded border text-xs font-bold hover:bg-purple-100 whitespace-nowrap">🎯 Calories</button>
                        </div>
                        <div class="flex gap-1 justify-end flex-wrap">
                            <button onclick="AdminStudents.openEdit('${st.id}')" class="student-action-btn bg-slate-50 text-slate-600 px-2 py-1 rounded text-xs border" title="Sửa">
                                <i data-lucide="edit-2" class="w-3 h-3"></i>
                            </button>
                            <button onclick="AdminStudents.toggleStatus('${st.id}','${st.status}')" class="student-action-btn bg-yellow-50 text-yellow-600 px-2 py-1 rounded text-xs border" title="Khóa/Mở">
                                ${st.status === 'Active' ? '🔒' : '🔓'}
                            </button>
                            <button onclick="AdminStudents.deleteStudent('${st.id}','${st.name}')" class="student-action-btn bg-red-50 text-red-600 px-2 py-1 rounded text-xs border" title="Xóa">
                                <i data-lucide="trash-2" class="w-3 h-3"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        lucide.createIcons();
        
        // Trigger scroll detection after render (for desktop)
        if (!isMobile && typeof AdminPage !== 'undefined' && AdminPage.setupTableScrollDetection) {
            setTimeout(() => AdminPage.setupTableScrollDetection(), 100);
        }
    },

    async topUp(id, name) {
        const amount = prompt(`Nạp thêm buổi cho ${name}?`, "10");
        if (!amount) return;

        try {
            Loader.show();
            const result = await API.adminUpdateStudent({ 
                studentId: id, 
                addSession: parseInt(amount) 
            });
            
            if (result.success) {
                Toast.success("Đã nạp");
                // Refresh immediately without delay for better UX
                await this.refresh(200);
            } else {
                Toast.error(result.message || 'Lỗi nạp buổi');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    openExtendModal(id) {
        document.getElementById('ext-id').value = id;
        AdminCalendar.toggleModal('modal-extend');
    },

    async submitExtend() {
        const id = document.getElementById('ext-id').value;
        const date = document.getElementById('ext-date').value;
        
        if (!date) {
            Toast.error("Chọn ngày");
            return;
        }

        try {
            Loader.show();
            const result = await API.adminUpdateStudent({ 
                studentId: id, 
                setExpiryDate: date 
            });
            
            if (result.success) {
                Toast.success("Đã gia hạn");
                AdminCalendar.toggleModal('modal-extend');
                // Refresh immediately without delay for better UX
                await this.refresh(200);
            } else {
                Toast.error(result.message || 'Lỗi gia hạn');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    async deleteStudent(id, name) {
        if (!confirm(`XÓA VĨNH VIỄN ${name}?\n\nTất cả dữ liệu liên quan (lịch học, giáo án, nhật ký tập luyện, v.v.) sẽ bị xóa theo.`)) return;

        try {
            Loader.show();
            console.log('[AdminStudents.deleteStudent] Deleting student:', id, name);
            
            const result = await API.adminDeleteStudent(id);
            console.log('[AdminStudents.deleteStudent] Result:', result);
            
            if (result.success) {
                Toast.success("Đã xóa học viên");
                await this.refresh(200);
                if (typeof AdminDashboard !== 'undefined' && AdminDashboard.load) {
                    await AdminDashboard.load();
                }
            } else {
                console.error('[AdminStudents.deleteStudent] Delete failed:', result.message);
                Toast.error(result.message || 'Lỗi xóa học viên');
            }
        } catch (error) {
            console.error('[AdminStudents.deleteStudent] Error:', error);
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    openEdit(id) {
        const student = this.students.find(s => s.id === id);
        if (!student) return;

        document.getElementById('edt-st-id').value = id;
        document.getElementById('edt-st-name').value = student.name;
        document.getElementById('edt-st-email').value = student.email;
        document.getElementById('edt-st-phone').value = student.phone || '';
        AdminCalendar.toggleModal('modal-edit-student');
    },

    async submitEdit() {
        try {
            Loader.show();
            const result = await API.adminEditStudentInfo({
                id: document.getElementById('edt-st-id').value,
                name: document.getElementById('edt-st-name').value,
                email: document.getElementById('edt-st-email').value,
                phone: document.getElementById('edt-st-phone').value
            });
            
            if (result.success) {
                Toast.success("Đã cập nhật");
                AdminCalendar.toggleModal('modal-edit-student');
                await this.refresh();
            } else {
                Toast.error(result.message || 'Lỗi cập nhật');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    async toggleStatus(id, currentStatus) {
        if (!confirm("Đổi trạng thái?")) return;

        try {
            Loader.show();
            const result = await API.adminUpdateStudent({ 
                studentId: id, 
                status: currentStatus === 'Active' ? 'Inactive' : 'Active' 
            });
            
            if (result.success) {
                await this.refresh();
            } else {
                Toast.error(result.message || 'Lỗi đổi trạng thái');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    async register(data) {
        try {
            Loader.show();
            const result = await API.call('register', data); // Use call for register
            
            if (result.success) {
                Toast.success("Đã thêm học viên");
                AdminCalendar.toggleModal('modal-add-student');
                await this.refresh();
            } else {
                Toast.error(result.message || 'Lỗi thêm học viên');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    fillDropdowns() {
        if (!this.students || this.students.length === 0) {
            console.warn('No students data to fill dropdowns');
            return;
        }
        
        const optsNormal = '<option value="">-- Chọn Học Viên --</option><option value="TEMPLATE" class="font-bold text-blue-600">★ LƯU LÀM MẪU</option>' + 
            this.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        
        const planStudent = document.getElementById('plan-student');
        const bkStudent = document.getElementById('bk-student');
        const assignStudents = document.getElementById('assign-students');
        const mealplanStudent = document.getElementById('mealplan-student-select');
        
        if (planStudent) planStudent.innerHTML = optsNormal;
        if (bkStudent) bkStudent.innerHTML = '<option value="">-- Chọn --</option>' + 
            this.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        if (assignStudents) assignStudents.innerHTML = 
            this.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    },

    openSetTargetCalories(id, name, currentTarget) {
        document.getElementById('target-cal-student-id').value = id;
        document.getElementById('target-cal-student-name').innerText = name;
        document.getElementById('target-cal-input').value = currentTarget || 2000;
        toggleModal('modal-set-target-calories');
    },

    async saveTargetCalories() {
        const id = document.getElementById('target-cal-student-id').value;
        const calories = parseFloat(document.getElementById('target-cal-input').value) || 2000;
        
        if (!id) {
            Toast.error('Không tìm thấy học viên');
            return;
        }

        if (calories <= 0) {
            Toast.error('Calories phải lớn hơn 0');
            return;
        }

        try {
            Loader.show();
            const result = await AdminService.setUserTargets(id, { calories });
            
            if (result.success) {
                Toast.success("Đã cập nhật mục tiêu calories");
                toggleModal('modal-set-target-calories');
                await this.refresh();
            } else {
                Toast.error(result.message || 'Lỗi cập nhật');
            }
        } catch (error) {
            console.error('Error saving target calories:', error);
            Toast.error('Lỗi: ' + (error.message || 'Không thể lưu mục tiêu'));
        } finally {
            Loader.hide();
        }
    }
};

window.AdminStudents = AdminStudents;

