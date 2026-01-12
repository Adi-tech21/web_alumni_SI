// GANTI URL DEPLOY BARU
const API_URL = 'https://script.google.com/macros/s/AKfycbzJgLF472FElgX_jb4BmAWKTPApY7ZYipHjodp_r46sXO-GtvgfABr_sb-D1uJ-wHxOVw/exec'; 

const user = JSON.parse(localStorage.getItem('user_alumni'));
const pageId = $('body').attr('id');

if (!user && pageId !== undefined && pageId !== 'page-login' && pageId !== 'page-register') {
    window.location.href = 'login.html';
}

$(document).ready(function() {
    
    // UI SETUP
    if(user) {
        $('#user-name').text(user.nama);
        $('#user-nim').text(user.nim);
        if(user.role === 'admin') {
            $('#role-badge').show();
            if(pageId === 'page-organisasi') $('#admin-area').show();
        }
    }

    // --- 1. LOGIN & REGISTER ---
    $('#form-login').submit(function(e) {
        e.preventDefault();
        const btn = $(this).find('button'); btn.text('Loading...').prop('disabled', true);
        $.post(API_URL, $(this).serialize() + "&action=login", function(res) {
            if(res.status === 'success') {
                localStorage.setItem('user_alumni', JSON.stringify(res.user));
                window.location.href = 'index.html';
            } else {
                alert(res.message); btn.text('Masuk').prop('disabled', false);
            }
        });
    });

    $('#form-register').submit(function(e) {
        e.preventDefault();
        const btn = $(this).find('button'); btn.text('Mendaftar...').prop('disabled', true);
        $.post(API_URL, $(this).serialize() + "&action=register", function(res) {
            alert(res.message);
            if(res.status === 'success') window.location.href = 'login.html';
            else btn.text('Daftar').prop('disabled', false);
        });
    });

    // --- 2. EDIT PROFIL ---
    if (pageId === 'page-profil') {
        $('input[name="nama"]').val(user.nama);
        $('input[name="nim"]').val(user.nim);
        $('input[name="email"]').val(user.email);
        $('input[name="tahun"]').val(user.tahun);
        $('input[name="pekerjaan"]').val(user.pekerjaan);
        $('input[name="linkedin"]').val(user.linkedin);
        $('input[name="foto"]').val(user.foto);
        $('input[name="skill"]').val(user.skill);

        $('#form-profil').submit(function(e) {
            e.preventDefault();
            if(!confirm("Simpan perubahan profil?")) return;
            const btn = $(this).find('button'); btn.text('Menyimpan...').prop('disabled', true);
            $.post(API_URL, $(this).serialize() + "&action=update_profile", function(res) {
                if(res.status === 'success') {
                    alert(res.message);
                    localStorage.setItem('user_alumni', JSON.stringify(res.user));
                    location.reload();
                } else {
                    alert(res.message); btn.text('Simpan Perubahan').prop('disabled', false);
                }
            });
        });
    }

    // --- 3. LOKER PAGE ---
    if (pageId === 'page-loker') {
        $.getJSON(API_URL + '?action=get_loker', function(res) {
            let html = (!res.data || res.data.length === 0) ? '<div class="col-12 text-center text-muted">Belum ada lowongan.</div>' : '';
            if(res.data) res.data.forEach(job => {
                let linkUrl = (job[6] && job[6] !== '-' && job[6] !== '#') ? job[6] : null;
                let btnLink = linkUrl ? `<a href="${linkUrl}" target="_blank" class="btn btn-sm btn-outline-primary stretched-link">Lihat Detail</a>` : `<button class="btn btn-sm btn-secondary" disabled>Info via DM</button>`;
                html += `<div class="col-md-6 mb-3"><div class="card h-100 shadow-sm border-0"><div class="card-body"><span class="badge bg-success mb-2">${job[4]}</span><h5 class="card-title fw-bold">${job[2]}</h5><h6 class="card-subtitle mb-2 text-muted"><i class="far fa-building"></i> ${job[3]}</h6><p class="card-text small mt-3" style="white-space: pre-line;">${job[5]}</p><div class="mt-3">${btnLink}</div></div><div class="card-footer bg-white text-muted small">Diposting: ${new Date(job[1]).toLocaleDateString()}</div></div></div>`;
            });
            $('#loker-container').html(html);
        });
        $('#form-loker').submit(function(e) {
            e.preventDefault(); if(!confirm("Terbitkan loker?")) return;
            $.post(API_URL, $(this).serialize() + "&action=post_loker", function(res) { alert(res.message); location.reload(); });
        });
    }

    // --- 4. DASHBOARD ---
    if (pageId === 'page-home') {
        $.getJSON(API_URL + '?action=get_events', function(res) {
            let html = (!res.data || res.data.length === 0) ? '<div class="p-3 text-center small text-muted">Belum ada agenda.</div>' : '';
            if(res.data) res.data.slice(0, 3).forEach(evt => {
                html += `<div class="list-group-item"><h6 class="mb-1 fw-bold text-danger">${evt[1]}</h6><small class="text-muted">${new Date(evt[2]).toLocaleDateString()} - ${evt[3]}</small></div>`;
            });
            $('#home-events-container').html(html);
        });
        $.getJSON(API_URL + '?action=get_loker', function(res) {
            let html = (!res.data || res.data.length === 0) ? '<p class="text-muted">Belum ada loker.</p>' : '';
            if(res.data) res.data.slice(0, 2).forEach(job => {
                 html += `<div class="card mb-2 shadow-sm"><div class="card-body p-3"><h6 class="fw-bold text-primary">${job[2]}</h6><small>${job[3]}</small></div></div>`;
            });
            $('#home-loker-summary').html(html);
        });
    }

    // --- 5. DIREKTORI ---
    if (pageId === 'page-alumni') {
        $.getJSON(API_URL + '?action=get_alumni', function(res) {
            let html = '';
            res.data.forEach(alumni => {
                let skills = alumni.skill ? alumni.skill.split(',').map(s=>`<span class="badge bg-light text-dark border me-1">${s}</span>`).join('') : '';
                let linkLinkedin = (alumni.linkedin && alumni.linkedin !== '#' && alumni.linkedin !== '-') ? `<a href="${alumni.linkedin}" target="_blank" class="btn btn-sm btn-primary mt-2"><i class="fab fa-linkedin"></i> Connect</a>` : '';
                html += `<div class="col-md-4 mb-3 item-alumni"><div class="card p-3 h-100 shadow-sm"><div class="d-flex align-items-center mb-3"><img src="${alumni.foto}" class="rounded-circle me-3" width="60" height="60" style="object-fit:cover"><div><h5 class="mb-0 fw-bold">${alumni.nama}</h5><small class="text-muted d-block">NIM: ${alumni.nim}</small><span class="badge bg-info text-dark">Angkatan ${alumni.tahun}</span></div></div><div class="mb-2"><small class="text-uppercase text-muted" style="font-size: 10px;">Pekerjaan</small><p class="mb-1 fw-bold text-dark">${alumni.pekerjaan || '-'}</p></div><div class="mb-2">${skills}</div>${linkLinkedin}</div></div>`;
            });
            $('#alumni-list').html(html);
        });
        $('#search-input').on('keyup', function() {
            let value = $(this).val().toLowerCase();
            $('.item-alumni').filter(function() { $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1) });
        });
    }

    // --- 6. FORUM & ORGANISASI ---
    if (pageId === 'page-forum') {
        loadForum();
        $('#form-thread').submit(function(e) { e.preventDefault(); $.post(API_URL, $(this).serialize() + "&action=post_thread&email=" + user.email, function(){ alert("Terkirim"); location.reload(); }); });
        $('#form-comment').submit(function(e) { e.preventDefault(); $.post(API_URL, $(this).serialize() + "&action=post_comment&email=" + user.email, function(){ $('#form-comment')[0].reset(); loadComments($('#current-thread-id').val()); }); });
    }

    // --- 7. ORGANISASI (DENGAN EDIT/HAPUS) ---
    if (pageId === 'page-organisasi') {
        
        // Load Struktur dengan Tombol Edit (Hanya utk Admin)
        $.getJSON(API_URL + '?action=get_struktur', function(res) {
            let html = '';
            res.data.forEach(i => {
                // Tombol Edit/Hapus khusus Admin
                let adminControls = '';
                if(user.role === 'admin') {
                    // Masukkan data ke parameter fungsi
                    adminControls = `
                    <div class="mt-2">
                        <button onclick="editStruktur('${i[0]}','${i[1]}','${i[2]}','${i[4]}','${i[3]}')" class="btn btn-sm btn-warning text-white"><i class="fas fa-edit"></i></button>
                        <button onclick="hapusStruktur('${i[0]}')" class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button>
                    </div>`;
                }

                html += `
                <div class="col-6 col-md-3 text-center mb-4">
                    <img src="${i[3] || 'https://via.placeholder.com/150'}" class="rounded-circle mb-2 shadow-sm" width="80" height="80" style="object-fit:cover;">
                    <h6 class="fw-bold mb-0">${i[1]}</h6>
                    <span class="badge bg-primary mb-1">${i[2]}</span>
                    ${adminControls}
                </div>`;
            });
            $('#struktur-container').html(html);
        });

        // Load Proker (Tampilkan saja)
        $.getJSON(API_URL + '?action=get_proker', function(res) {
            let html = '';
            res.data.forEach(i => {
                html += `<tr><td>${i[1]}</td><td>${i[2]}</td><td>${i[4]}</td><td><span class="badge bg-success">${i[3]}</span></td></tr>`;
            });
            $('#proker-container').html(html);
        });

        // HANDLE SUBMITS
        $('#form-event').submit(function(e){ e.preventDefault(); handleAdminPost(this, 'post_event'); });
        $('#form-proker').submit(function(e){ e.preventDefault(); handleAdminPost(this, 'post_proker'); });
        
        // Handle Submit Struktur (Bisa Post Baru atau Update)
        $('#form-struktur').submit(function(e){ 
            e.preventDefault(); 
            // Cek apakah ada ID? Jika ada = Update, Jika tidak = Baru
            let id = $('#struktur-id').val();
            let action = id ? 'update_struktur' : 'post_struktur';
            handleAdminPost(this, action); 
        });
    }
});

// --- HELPER FUNCTIONS ---

function logout() { localStorage.removeItem('user_alumni'); window.location.href = 'login.html'; }

function handleAdminPost(f, a) { 
    if(confirm("Simpan data?")) {
        const btn = $(f).find('button[type="submit"]');
        btn.text('Menyimpan...').prop('disabled', true);
        $.post(API_URL, $(f).serialize()+"&action="+a, function(r){ 
            alert(r.message); location.reload(); 
        }); 
    }
}

// FUNGSI EDIT STRUKTUR (Dipanggil dari tombol Edit HTML)
function editStruktur(id, nama, jabatan, urutan, foto) {
    // Scroll ke form
    document.getElementById('admin-area').scrollIntoView({ behavior: 'smooth' });
    
    // Buka Tab Struktur
    var tab = new bootstrap.Tab(document.querySelector('#adminTab button[data-bs-target="#tab-struktur"]'));
    tab.show();

    // Isi Form
    $('#struktur-id').val(id);
    $('#str-nama').val(nama);
    $('#str-jabatan').val(jabatan);
    $('#str-urutan').val(urutan);
    $('#str-foto').val(foto);

    // Ubah Tampilan Tombol
    $('#btn-save-struktur').text('Update Pengurus').removeClass('btn-success').addClass('btn-warning');
    $('#btn-cancel-struktur').show();
}

// FUNGSI BATAL EDIT
function resetFormStruktur() {
    $('#form-struktur')[0].reset();
    $('#struktur-id').val(''); // Hapus ID
    $('#btn-save-struktur').text('Simpan Pengurus').removeClass('btn-warning').addClass('btn-success');
    $('#btn-cancel-struktur').hide();
}

// FUNGSI HAPUS STRUKTUR
function hapusStruktur(id) {
    if(confirm("Yakin ingin menghapus pengurus ini?")) {
        $.post(API_URL, { action: 'delete_struktur', id: id }, function(res) {
            alert(res.message);
            location.reload();
        });
    }
}

// FUNGSI FORUM (Sama seperti sebelumnya)
function loadForum() { $('#forum-container').html('...'); $.getJSON(API_URL+'?action=get_forum', function(r){ let h=''; if(r.data) r.data.forEach(i=>{h+=`<div class="card mb-2"><div class="card-body"><h5>${i[4]}</h5><p>${i[5]}</p><button onclick="bukaDetail('${i[0]}','${i[4]}','${i[2]}','${i[5].replace(/\n/g,' ')}')" class="btn btn-sm btn-outline-primary">Lihat</button></div></div>`}); $('#forum-container').html(h); }); }
function bukaDetail(id,t,a,c) { $('#detail-judul').text(t); $('#detail-isi').text(c); $('#current-thread-id').val(id); new bootstrap.Modal('#modalDetail').show(); loadComments(id); }
function loadComments(id) { $.getJSON(API_URL+'?action=get_comments&id_thread='+id, function(r){ let h=''; if(r.data) r.data.forEach(c=>{h+=`<div class="alert alert-light p-2 mb-1"><small class="fw-bold">${c[3]}</small><p class="mb-0">${c[4]}</p></div>`}); $('#comments-list').html(h); }); }