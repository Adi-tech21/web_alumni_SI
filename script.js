// ==========================================
// KONFIGURASI API
// ==========================================
// PASTE URL DEPLOYMENT BARU DI SINI
const API_URL = 'https://script.google.com/macros/s/AKfycbwHtbhfMCgfWWyLmEC9-qK97Ku-CTQaYcXm7YdDqTxQ418PCltF1Wj9gC8KuGCImmgbKw/exec'; 

// Cek Sesi User
const user = JSON.parse(localStorage.getItem('user_alumni'));
const pageId = $('body').attr('id');

// Proteksi Halaman (Redirect jika belum login)
if (!user && pageId !== undefined && pageId !== 'page-login' && pageId !== 'page-register') {
    window.location.href = 'login.html';
}

$(document).ready(function() {
    
    // --- UI SETUP (NAVBAR & ADMIN BADGE) ---
    if(user) {
        $('#user-name').text(user.nama);
        
        // Jika Admin, tampilkan Badge dan Panel Admin
        if(user.role === 'admin') {
            $('#role-badge').show(); // Badge di navbar
            if(pageId === 'page-organisasi') {
                $('#admin-area').show(); // Panel di halaman organisasi
            }
        }
    }

    // ===========================
    // 1. AUTH (LOGIN & REGISTER)
    // ===========================
    $('#form-login').submit(function(e) {
        e.preventDefault();
        const btn = $(this).find('button');
        btn.text('Loading...').prop('disabled', true);

        $.post(API_URL, $(this).serialize() + "&action=login", function(res) {
            if(res.status === 'success') {
                localStorage.setItem('user_alumni', JSON.stringify(res.user));
                window.location.href = 'index.html';
            } else {
                alert(res.message);
                btn.text('Masuk').prop('disabled', false);
            }
        });
    });

    $('#form-register').submit(function(e) {
        e.preventDefault();
        const btn = $(this).find('button');
        btn.text('Mendaftar...').prop('disabled', true);

        $.post(API_URL, $(this).serialize() + "&action=register", function(res) {
            alert(res.message);
            if(res.status === 'success') window.location.href = 'login.html';
            else btn.text('Daftar').prop('disabled', false);
        });
    });

    // ===========================
    // 2. HALAMAN DASHBOARD (index.html)
    // ===========================
    if (pageId === 'page-home') {
        
        // A. Load Event Terbaru
        $.getJSON(API_URL + '?action=get_events', function(res) {
            let html = '';
            if(!res.data || res.data.length === 0) {
                html = '<div class="p-3 text-center text-muted">Belum ada agenda.</div>';
            } else {
                // Ambil 3 event teratas
                let events = res.data.slice(0, 3); 
                events.forEach(evt => {
                    let tgl = new Date(evt[2]).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                    html += `
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1 fw-bold text-danger">${evt[1]}</h6>
                            <small class="text-muted">${tgl}</small>
                        </div>
                        <small class="text-muted"><i class="fas fa-map-marker-alt"></i> ${evt[3]}</small>
                    </div>`;
                });
            }
            $('#home-events-container').html(html);
        });

        // B. Load Loker Terbaru
        $.getJSON(API_URL + '?action=get_loker', function(res) {
            let html = '';
            if(!res.data || res.data.length === 0) {
                html = '<div class="col-12"><div class="alert alert-info">Belum ada info loker terbaru.</div></div>';
            } else {
                res.data.forEach(job => {
                    html += `
                    <div class="col-md-6 mb-3">
                        <div class="card h-100 shadow-sm border-0">
                            <div class="card-body">
                                <span class="badge bg-success mb-2">${job[4]}</span>
                                <h5 class="card-title fw-bold">${job[2]}</h5>
                                <h6 class="card-subtitle mb-2 text-muted"><i class="far fa-building"></i> ${job[3]}</h6>
                                <p class="card-text small text-truncate">${job[5] || 'Cek detail...'}</p>
                                <a href="#" class="btn btn-sm btn-outline-primary stretched-link">Lihat Detail</a>
                            </div>
                        </div>
                    </div>`;
                });
            }
            $('#home-loker-container').html(html);
        });

        // C. Submit Loker Baru
        $('#form-loker').submit(function(e) {
            e.preventDefault();
            if(!confirm("Terbitkan loker sekarang?")) return;
            const btn = $(this).find('button');
            btn.text('Mengirim...').prop('disabled', true);

            $.post(API_URL, $(this).serialize() + "&action=post_loker", function(res) {
                alert(res.message);
                $('#modalLoker').modal('hide');
                $('#form-loker')[0].reset();
                btn.text('Terbitkan Loker').prop('disabled', false);
                location.reload(); 
            });
        });
    }

    // ===========================
    // 3. HALAMAN ORGANISASI (organisasi.html)
    // ===========================
    if (pageId === 'page-organisasi') {
        
        // A. Load Struktur
        $.getJSON(API_URL + '?action=get_struktur', function(res) {
            let html = '';
            if(!res.data || res.data.length === 0) {
                html = '<p>Data pengurus belum diisi.</p>';
            } else {
                res.data.forEach(item => {
                    html += `
                    <div class="col-md-3 col-6 mb-4">
                        <div class="card h-100 border-0 shadow-sm text-center py-3">
                            <img src="${item[3] || 'https://ui-avatars.com/api/?name='+item[1]}" class="rounded-circle mx-auto mb-2" width="100" height="100" style="object-fit:cover;">
                            <h5 class="fw-bold mb-1">${item[1]}</h5>
                            <span class="badge bg-primary">${item[2]}</span>
                        </div>
                    </div>`;
                });
            }
            $('#struktur-container').html(html);
        });

        // B. Load Proker
        $.getJSON(API_URL + '?action=get_proker', function(res) {
            let html = '';
            if(res.data) res.data.forEach(item => {
                let badge = item[3] === 'Terlaksana' ? 'success' : (item[3] === 'Berjalan' ? 'primary' : 'warning');
                html += `
                <tr>
                    <td class="fw-bold">${item[1]}</td>
                    <td>${item[2]}</td>
                    <td>${item[4]}</td>
                    <td><span class="badge bg-${badge}">${item[3]}</span></td>
                </tr>`;
            });
            $('#proker-container').html(html);
        });

        // C. ADMIN SUBMITS (Event, Struktur, Proker)
        // Fungsi helper ada di paling bawah script ini
        $('#form-event').submit(function(e) {
            e.preventDefault(); handleAdminPost(this, 'post_event', 'Event Terkirim!');
        });
        $('#form-struktur').submit(function(e) {
            e.preventDefault(); handleAdminPost(this, 'post_struktur', 'Pengurus Disimpan!');
        });
        $('#form-proker').submit(function(e) {
            e.preventDefault(); handleAdminPost(this, 'post_proker', 'Proker Disimpan!');
        });
    }

    // ===========================
    // 4. HALAMAN FORUM (forum.html)
    // ===========================
    if (pageId === 'page-forum') {
        loadForum(); // Panggil fungsi load

        // Post Thread
        $('#form-thread').submit(function(e) {
            e.preventDefault();
            let data = $(this).serialize() + "&action=post_thread&email=" + user.email;
            $.post(API_URL, data, function(res) {
                alert("Topik berhasil diposting!");
                $('#modalThread').modal('hide');
                $('#form-thread')[0].reset();
                loadForum(); 
            });
        });

        // Post Komentar
        $('#form-comment').submit(function(e) {
            e.preventDefault();
            let idThread = $('#current-thread-id').val();
            let data = $(this).serialize() + "&action=post_comment&email=" + user.email;
            let btn = $(this).find('button');
            btn.text('...').prop('disabled', true);

            $.post(API_URL, data, function(res) {
                loadComments(idThread); 
                $('#form-comment')[0].reset(); 
                btn.text('Kirim').prop('disabled', false);
            });
        });
    }

    // ===========================
    // 5. HALAMAN DIREKTORI (alumni.html)
    // ===========================
    if (pageId === 'page-alumni') {
        $.getJSON(API_URL + '?action=get_alumni', function(res) {
            let html = '';
            res.data.forEach(alumni => {
                let skillHtml = '';
                if(alumni.skill) {
                    let skills = alumni.skill.split(',');
                    skills.forEach(s => {
                        skillHtml += `<span class="badge bg-light text-dark border me-1 mb-1">${s.trim()}</span>`;
                    });
                }
                html += `
                <div class="col-md-4 mb-3 item-alumni">
                    <div class="card p-3 h-100 shadow-sm">
                        <div class="d-flex align-items-center mb-3">
                            <img src="${alumni.foto}" class="rounded-circle me-3" width="60" height="60">
                            <div>
                                <h5 class="mb-0 fw-bold">${alumni.nama}</h5>
                                <small class="text-muted">Angkatan ${alumni.tahun}</small>
                            </div>
                        </div>
                        <div class="mb-2">
                            <small class="text-uppercase text-muted" style="font-size: 10px;">Pekerjaan</small>
                            <p class="mb-1 fw-bold text-primary">${alumni.pekerjaan || '-'}</p>
                        </div>
                        <div>
                            <small class="text-uppercase text-muted" style="font-size: 10px;">Keahlian</small>
                            <div class="d-flex flex-wrap mt-1">${skillHtml || '-'}</div>
                        </div>
                    </div>
                </div>`;
            });
            $('#alumni-list').html(html);
        });

        // Search Filter
        $('#search-input').on('keyup', function() {
            let value = $(this).val().toLowerCase();
            $('.item-alumni').filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        });
    }
});


// ==========================================
// FUNGSI HELPER / GLOBAL
// ==========================================

// 1. Logout
function logout() {
    localStorage.removeItem('user_alumni');
    window.location.href = 'login.html';
}

// 2. Helper untuk Admin Submit (Agar tidak menulis kode berulang)
function handleAdminPost(form, action, msg) {
    if(!confirm("Simpan data ini?")) return;
    const btn = $(form).find('button');
    btn.text('Menyimpan...').prop('disabled', true);
    
    $.post(API_URL, $(form).serialize() + "&action=" + action, function(res) {
        alert(res.message);
        $(form)[0].reset();
        btn.text('Simpan').prop('disabled', false);
        location.reload(); // Refresh agar data baru muncul
    });
}

// 3. Load Forum
function loadForum() {
    $('#forum-container').html('<p class="text-center">Memuat diskusi...</p>');
    
    $.getJSON(API_URL + '?action=get_forum', function(res) {
        let html = '';
        if(!res.data || res.data.length === 0) {
            html = '<div class="text-center text-muted">Belum ada diskusi.</div>';
        } else {
            res.data.forEach(item => {
                let isiBersih = item[5] ? item[5].replace(/(\r\n|\n|\r)/gm, " ") : "";
                html += `
                <div class="col-12 mb-3">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <span class="badge bg-info">${item[3]}</span>
                                <small class="text-muted">${new Date(item[1]).toLocaleDateString()}</small>
                            </div>
                            <h5 class="card-title mt-2">${item[4]}</h5>
                            <p class="card-text text-truncate">${item[5]}</p>
                            <button class="btn btn-sm btn-outline-primary" 
                                onclick="bukaDetail('${item[0]}', '${item[4]}', '${item[2]}', '${isiBersih}')">
                                <i class="fas fa-comments"></i> Lihat & Balas
                            </button>
                        </div>
                    </div>
                </div>`;
            });
        }
        $('#forum-container').html(html);
    });
}

// 4. Buka Modal Detail
function bukaDetail(id, judul, author, isi) {
    $('#detail-judul').text(judul);
    $('#detail-info').text('Oleh: ' + author);
    $('#detail-isi').text(isi);
    $('#current-thread-id').val(id); 

    $('#comments-list').html('<p class="text-muted small">Memuat komentar...</p>');
    
    // Buka Modal Bootstrap
    var myModal = new bootstrap.Modal(document.getElementById('modalDetail'));
    myModal.show();

    loadComments(id);
}

// 5. Load Komentar
function loadComments(idThread) {
    $.getJSON(API_URL + '?action=get_comments&id_thread=' + idThread, function(res) {
        let html = '';
        if(!res.data || res.data.length === 0) {
            html = '<p class="text-muted small">Belum ada komentar. Jadilah yang pertama!</p>';
        } else {
            res.data.forEach(com => {
                html += `
                <div class="card mb-2 bg-light border-0">
                    <div class="card-body p-2">
                        <strong class="small text-primary">${com[3]}</strong>
                        <p class="mb-0 small">${com[4]}</p>
                    </div>
                </div>`;
            });
        }
        $('#comments-list').html(html);
    });
}