// =======================================================
// ADMIN FOODS MODULE
// =======================================================

const AdminFoods = {
    foods: [],

    async init() {
        await this.load();
        this.render();
    },

    async load() {
        try {
            const result = await AdminService.getFoods(true);
            if (result.success) {
                this.foods = result.data || [];
            }
        } catch (error) {
            Toast.error('Lỗi tải danh sách món ăn');
        }
    },

    render() {
        const container = document.getElementById('fd-list');
        
        if (!this.foods || this.foods.length === 0) {
            container.innerHTML = '<tr><td colspan="2" class="p-10 text-center text-slate-400">Chưa có món ăn nào.</td></tr>';
            return;
        }

        container.innerHTML = this.foods.map(f => `
            <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                <td class="p-4 align-middle">
                    <div class="font-bold text-slate-800 text-sm mb-2">${f.name}</div>
                    <div class="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wide">
                        <span class="px-2 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200" title="Calories">
                            ${f.cal} <span class="font-normal normal-case text-slate-400">kcal</span>
                        </span>
                        <span class="px-2 py-1 rounded-md bg-red-50 text-red-600 border border-red-100" title="Protein">
                            Pro: ${f.pro}
                        </span>
                        <span class="px-2 py-1 rounded-md bg-green-50 text-green-600 border border-green-100" title="Carbs">
                            Carb: ${f.carb}
                        </span>
                        <span class="px-2 py-1 rounded-md bg-yellow-50 text-yellow-600 border border-yellow-100" title="Fat">
                            Fat: ${f.fat}
                        </span>
                    </div>
                </td>
                <td class="p-4 text-right align-middle whitespace-nowrap">
                    <div class="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                        <button onclick='AdminFoods.edit(${JSON.stringify(f)})' class="p-2 rounded-lg bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm" title="Sửa">
                            <i data-lucide="edit-3" class="w-4 h-4"></i>
                        </button>
                        <button onclick="AdminFoods.delete('${f.id}')" class="p-2 rounded-lg bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm" title="Xóa">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        lucide.createIcons();
    },

    edit(food) {
        document.getElementById('fd-id-edit').value = food.id;
        document.getElementById('fd-name').value = food.name;
        document.getElementById('fd-cal').value = food.cal;
        document.getElementById('fd-unit').value = food.unit || '100g';
        document.getElementById('fd-pro').value = food.pro || 0;
        document.getElementById('fd-carb').value = food.carb || 0;
        document.getElementById('fd-fat').value = food.fat || 0;
        document.getElementById('fd-form-title').innerText = "Sửa Món";
        document.getElementById('btn-fd-save').innerText = "Cập Nhật";
    },

    resetForm() {
        document.getElementById('form-food').reset();
        document.getElementById('fd-id-edit').value = "";
        document.getElementById('fd-form-title').innerText = "Thêm Món";
        document.getElementById('btn-fd-save').innerText = "Thêm Mới";
    },

    async save() {
        const id = document.getElementById('fd-id-edit').value;
        const data = {
            id: id || undefined,
            name: document.getElementById('fd-name').value,
            cal: parseFloat(document.getElementById('fd-cal').value) || 0,
            unit: document.getElementById('fd-unit').value || '100g',
            pro: parseFloat(document.getElementById('fd-pro').value) || 0,
            carb: parseFloat(document.getElementById('fd-carb').value) || 0,
            fat: parseFloat(document.getElementById('fd-fat').value) || 0
        };

        try {
            Loader.show();
            const result = id ? await API.adminUpdateFood(data) : await API.adminAddFood(data);
            
            if (result.success) {
                Toast.success("Thành công");
                await this.init();
                this.resetForm();
            } else {
                Toast.error(result.message || 'Lỗi lưu món ăn');
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
            this.foods = this.foods.filter(x => x.id !== id);
            this.render();

            Loader.show();
            const result = await API.adminDeleteFood(id);
            
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
        const rows = document.querySelectorAll('#fd-list tr');
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(keyword.toLowerCase()) ? '' : 'none';
        });
    }
};

window.AdminFoods = AdminFoods;

