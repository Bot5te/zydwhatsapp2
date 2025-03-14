// دالة لجلب الخيارات الحالية من السيرفر
async function fetchOptions() {
    const response = await fetch('/options');
    const data = await response.json();
    return data.options;
}

// دالة لعرض الخيارات في الواجهة
async function renderOptions() {
    const options = await fetchOptions();
    const optionsList = document.getElementById('options-list');
    optionsList.innerHTML = '';

    options.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.innerHTML = `
            <span>${option.id} - ${option.label}</span>
            <button onclick="deleteOption('${option.id}')">حذف</button>
        `;

        if (option.subOptions && option.subOptions.length > 0) {
            const subOptionsDiv = document.createElement('div');
            subOptionsDiv.className = 'sub-options';
            option.subOptions.forEach(subOpt => {
                const subOptionDiv = document.createElement('div');
                subOptionDiv.className = 'sub-option';
                subOptionDiv.innerHTML = `
                    <span>${subOpt.id} - ${subOpt.label}</span>
                    <button onclick="deleteSubOption('${option.id}', '${subOpt.id}')">حذف</button>
                `;
                subOptionsDiv.appendChild(subOptionDiv);
            });
            optionDiv.appendChild(subOptionsDiv);
        }

        optionsList.appendChild(optionDiv);
    });
}

// دالة لحذف خيار رئيسي
async function deleteOption(id) {
    const response = await fetch(`/options/${id}`, {
        method: 'DELETE'
    });
    if (response.ok) {
        alert('تم حذف الخيار بنجاح');
        renderOptions();
    } else {
        alert('حدث خطأ أثناء حذف الخيار');
    }
}

// دالة لحذف خيار فرعي
async function deleteSubOption(mainOptionId, subOptionId) {
    const options = await fetchOptions();
    const mainOption = options.find(opt => opt.id === mainOptionId);
    if (mainOption && mainOption.subOptions) {
        mainOption.subOptions = mainOption.subOptions.filter(subOpt => subOpt.id !== subOptionId);
        await fetch(`/options/${mainOptionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mainOption)
        });
        alert('تم حذف الخيار الفرعي بنجاح');
        renderOptions();
    } else {
        alert('حدث خطأ أثناء حذف الخيار الفرعي');
    }
}

// دالة لإضافة خيار رئيسي
async function addOption() {
    const id = document.getElementById('option-id').value;
    const label = document.getElementById('option-label').value;
    const response = document.getElementById('option-response').value;

    const subOptions = [];
    const subOptionFields = document.querySelectorAll('.sub-option-field');
    subOptionFields.forEach(field => {
        const subId = field.querySelector('.sub-option-id').value;
        const subLabel = field.querySelector('.sub-option-label').value;
        const subResponse = field.querySelector('.sub-option-response').value;
        if (subId && subLabel && subResponse) {
            subOptions.push({ id: subId, label: subLabel, response: subResponse });
        }
    });

    const newOption = {
        id,
        label,
        response,
        subOptions
    };

    const result = await fetch('/options', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newOption)
    });

    if (result.ok) {
        alert('تم إضافة الخيار بنجاح');
        document.getElementById('option-id').value = '';
        document.getElementById('option-label').value = '';
        document.getElementById('option-response').value = '';
        document.getElementById('sub-options-container').innerHTML = '';
        renderOptions();
    } else {
        alert('حدث خطأ أثناء إضافة الخيار');
    }
}

// دالة لإضافة حقول خيار فرعي
function addSubOptionField() {
    const container = document.getElementById('sub-options-container');
    const subOptionDiv = document.createElement('div');
    subOptionDiv.className = 'sub-option-field';
    subOptionDiv.innerHTML = `
        <input type="text" class="sub-option-id" placeholder="رقم الخيار الفرعي (مثال: 1.1)">
        <input type="text" class="sub-option-label" placeholder="عنوان الخيار الفرعي">
        <textarea class="sub-option-response" placeholder="الرد على الخيار الفرعي"></textarea>
    `;
    container.appendChild(subOptionDiv);
}

// عرض الخيارات عند تحميل الصفحة
window.onload = renderOptions;
