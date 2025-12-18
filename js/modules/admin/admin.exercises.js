// =======================================================
// ADMIN EXERCISES MODULE
// =======================================================

const AdminExercises = {
    exercises: [],

    async init() {
        await this.load();
        this.render();
    },

    async load() {
        try {
            const result = await AdminService.getExercises(true);
            if (result.success) {
                this.exercises = result.data || [];
            }
        } catch (error) {
            Toast.error('Lỗi tải danh sách bài tập');
        }
    },

    render() {
        const container = document.getElementById('ex-list');
        const datalist = document.getElementById('dl-exercises');
        
        if (datalist) {
            datalist.innerHTML = this.exercises.map(e => `<option value="${e.name}">`).join('');
        }

        if (!this.exercises || this.exercises.length === 0) {
            container.innerHTML = '<tr><td colspan="3" class="p-10 text-center text-slate-400">Chưa có bài tập nào.</td></tr>';
            return;
        }

        container.innerHTML = this.exercises.map(e => `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-3">
                    <div class="font-medium text-slate-800">${e.name}</div>
                    ${e.image ? `<a href="${e.image}" target="_blank" class="text-[10px] text-blue-500 hover:underline flex items-center gap-1">
                        <i data-lucide="image" class="w-3 h-3"></i> Xem ảnh
                    </a>` : ''}
                </td>
                <td class="p-3 text-slate-500 text-xs">${e.group_name || e.group || 'Chưa phân loại'}</td>
                <td class="p-3 text-right space-x-1">
                    <button onclick='AdminExercises.edit(${JSON.stringify(e)})' class="text-blue-500 hover:text-blue-700">
                        <i data-lucide="edit-2" class="w-4"></i>
                    </button>
                    <button onclick="AdminExercises.delete('${e.id}')" class="text-red-400">
                        <i data-lucide="trash-2" class="w-4"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        lucide.createIcons();
    },

    edit(exercise) {
        document.getElementById('ex-id-edit').value = exercise.id;
        document.getElementById('ex-name').value = exercise.name;
        document.getElementById('ex-group').value = exercise.group_name || exercise.group || "";
        document.getElementById('ex-image').value = exercise.image || "";
        document.getElementById('ex-desc').value = exercise.description || exercise.desc || "";
        document.getElementById('ex-form-title').innerText = "Sửa Bài Tập";
        document.getElementById('btn-ex-save').innerText = "Cập Nhật";
    },

    resetForm() {
        document.getElementById('form-exercise').reset();
        document.getElementById('ex-id-edit').value = "";
        document.getElementById('ex-form-title').innerText = "Thêm Bài";
        document.getElementById('btn-ex-save').innerText = "Thêm Mới";
    },

    async save() {
        const id = document.getElementById('ex-id-edit').value;
        const data = {
            id: id || undefined,
            name: document.getElementById('ex-name').value,
            group: document.getElementById('ex-group').value,
            image: document.getElementById('ex-image').value,
            desc: document.getElementById('ex-desc').value
        };

        try {
            Loader.show();
            const result = id ? await API.adminUpdateExercise(data) : await API.adminAddExercise(data);
            
            if (result.success) {
                Toast.success("Thành công");
                await this.init();
                this.resetForm();
            } else {
                Toast.error(result.message || 'Lỗi lưu bài tập');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    async delete(id) {
        if (!confirm("Xóa?")) return;

        try {
            // Optimistic UI
            this.exercises = this.exercises.filter(x => x.id !== id);
            this.render();

            Loader.show();
            const result = await API.adminDeleteExercise(id);
            
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
    },

    filter(keyword) {
        const rows = document.querySelectorAll('#ex-list tr');
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(keyword.toLowerCase()) ? '' : 'none';
        });
    }
};

window.AdminExercises = AdminExercises;

