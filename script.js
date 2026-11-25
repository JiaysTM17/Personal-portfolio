// Trương Gia Kiệt Portfolio - Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // 3. Project Filter Tabs
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active', 'bg-brand-600', 'text-white');
        b.classList.add('bg-[#13161e]', 'text-gray-400');
      });
      btn.classList.add('active', 'bg-brand-600', 'text-white');
      btn.classList.remove('bg-[#13161e]', 'text-gray-400');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 4. Project Modal Data & Lightbox
  const projectDetails = {
    'utecoffe': {
      title: 'UTECOFFE — SPECIALTY TEA & COFFEE OMO PLATFORM',
      category: 'ENTERPRISE E-COMMERCE',
      tools: 'Java 21, Spring Boot 3.3.5, PostgreSQL (34 Bảng), WebSocket STOMP, Docker, Cloudinary',
      img: 'assets/utecoffe.png',
      link: 'https://github.com/JiaysTM17/UTECoffe',
      desc: 'Đồ án hệ sinh thái thương mại điện tử chuyên sâu cho chuỗi bán trà và cà phê đặc sản UTECoffe. Tích hợp mô hình OMO (Online-Merge-Offline), quầy Barista KDS cập nhật đơn hàng realtime qua WebSocket STOMP, CSDL 34 bảng quan hệ chuẩn hóa 3NF, 8 thuật toán doanh nghiệp tối ưu giá thành và tồn kho, hỗ trợ chạy 24/7 trên tên miền chính thức utecoffe.io.vn.'
    },
    'nexora': {
      title: 'NEXORA — NEXT-GEN FASHION MARKETPLACE',
      category: 'FASHION MARKETPLACE',
      tools: 'React.js, Node.js, Express, MongoDB, Tailwind CSS, REST API',
      img: 'assets/nexora.jpg',
      link: 'https://github.com/JiaysTM17/nexora',
      desc: 'NEXORA là sàn thương mại điện tử thời trang thế hệ mới tích hợp mạng xã hội phong cách OOTD Community, chương trình đổi thời trang cũ Re-Loved Trade-In và nền tảng chăm sóc đồ xa xỉ Luxury VAS Care. Hệ thống sở hữu bộ nhận diện thương hiệu chỉn chu và kiến trúc frontend - backend hiện đại.'
    },
    'fullstack-ecommerce': {
      title: 'FULLSTACK E-COMMERCE PLATFORM',
      category: 'FULLSTACK SYSTEM',
      tools: 'React, Node.js, Express, MongoDB, Jest (3.151 Tests), OWASP Security',
      img: 'assets/project-solartrip.png',
      link: 'https://github.com/JiaysTM17/Fullstack-Ecommerce',
      desc: 'Hệ thống website thương mại điện tử hoàn chỉnh đạt tỷ lệ pass test 100% với 3.151 automated tests trong 1.29s. Tích hợp két ký quỹ Escrow bảo vệ người mua, hệ thống voucher kép, hóa đơn giá trị gia tăng VAT, theo dõi GPS vận chuyển SPX Logistics và tuân thủ các quy tắc bảo mật OWASP khắt khe.'
    },
    'kiet-assistant': {
      title: 'KIỆT ASSISTANT — AI PORTFOLIO AGENT',
      category: 'AI & LLM AGENT',
      tools: 'Gemini API, Node.js, Express, RESTful API, Bilingual Support (VI/EN)',
      img: 'assets/project-poster.png',
      link: 'https://github.com/JiaysTM17/portfolio-assistant-api',
      desc: 'Dịch vụ API trợ lý trí tuệ nhân tạo (AI Assistant) xây dựng trên nền tảng Google Gemini API. Trợ lý tự động xử lý ngôn ngữ tự nhiên song ngữ Việt - Anh, đối chiếu hồ sơ công khai từ GitHub để giải đáp về học vấn, kỹ năng, các đề tài đã thực hiện và mục tiêu tuyển dụng của Trương Gia Kiệt.'
    },
    'task-manager': {
      title: 'TASK MANAGER WEB APPLICATION',
      category: 'WEB APPLICATION',
      tools: 'JavaScript ES6+, HTML5, CSS3 Grid, LocalStorage',
      img: 'assets/project-bali.png',
      link: 'https://github.com/JiaysTM17/task-manager',
      desc: 'Ứng dụng quản lý công việc và tiến độ cá nhân trực quan. Hỗ trợ tạo tác vụ, phân loại trạng thái (Todo, In Progress, Done), gắn tag độ ưu tiên, đếm ngược deadline và lưu trữ dữ liệu bền vững trên trình duyệt.'
    },
    'ltw-video': {
      title: 'LTW JPA & SITEMESH VIDEO STREAMING SYSTEM',
      category: 'BACKEND ARCHITECTURE',
      tools: 'Spring Boot, Spring Data JPA, Sitemesh 3, PostgreSQL, Bootstrap 5',
      img: 'assets/project-tour.png',
      link: 'https://github.com/JiaysTM17/LTW_BT16.11.2026_JPA_Video',
      desc: 'Hệ thống website truyền phát và quản lý video học phần Lập trình Web tại trường Đại học Sư phạm Kỹ thuật TP.HCM (HCMUTE). Áp dụng Spring Boot, phân quyền người dùng, trang trí layout bằng Sitemesh 3 và tối ưu các thao tác CRUD dữ liệu video.'
    }
  };

  const modal = document.getElementById('project-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalCategory = document.getElementById('modal-category');
  const modalTools = document.getElementById('modal-tools');
  const modalDesc = document.getElementById('modal-desc');
  const modalLink = document.getElementById('modal-link');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  function openModal(projectId) {
    const data = projectDetails[projectId] || {
      title: 'DỰ ÁN PHẦN MỀM',
      category: 'SOFTWARE PROJECT',
      tools: 'Spring Boot, React, Node.js',
      img: 'assets/utecoffe.png',
      link: 'https://github.com/JiaysTM17',
      desc: 'Dự án thực hiện bởi Trương Gia Kiệt.'
    };

    modalImg.src = data.img;
    modalImg.alt = data.title;
    modalTitle.textContent = data.title;
    modalCategory.textContent = data.category;
    modalTools.textContent = data.tools;
    modalDesc.textContent = data.desc;
    if (modalLink) {
      modalLink.href = data.link;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  window.closeModal = function() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      openModal(id);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // 5. Accordion for Technical Areas
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach((item, index) => {
    const trigger = item.querySelector('.accordion-trigger');
    const content = item.querySelector('.accordion-content');
    const icon = item.querySelector('.accordion-icon');

    if (index === 0) {
      content.classList.remove('hidden');
      if (icon) icon.classList.add('rotate-180');
      item.classList.add('border-brand-600/60');
    }

    trigger.addEventListener('click', () => {
      const isCurrentlyOpen = !content.classList.contains('hidden');

      accordionItems.forEach(otherItem => {
        const otherContent = otherItem.querySelector('.accordion-content');
        const otherIcon = otherItem.querySelector('.accordion-icon');
        otherContent.classList.add('hidden');
        if (otherIcon) otherIcon.classList.remove('rotate-180');
        otherItem.classList.remove('border-brand-600/60');
      });

      if (!isCurrentlyOpen) {
        content.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
        item.classList.add('border-brand-600/60');
      }
    });
  });

  // 6. Contact Form Submission
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Đang gửi...</span>`;

      setTimeout(() => {
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        if (formSuccess) {
          formSuccess.classList.remove('hidden');
          setTimeout(() => {
            formSuccess.classList.add('hidden');
          }, 6000);
        }
      }, 800);
    });
  }

  // 7. Resume Download Button
  const downloadCvBtn = document.getElementById('download-cv-btn');
  if (downloadCvBtn) {
    downloadCvBtn.addEventListener('click', () => {
      alert('Đang hiển thị bản tóm tắt hồ sơ của Trương Gia Kiệt (Software & Fullstack Developer). Bạn cũng có thể liên hệ trực tiếp qua email truonggiakiet110806@gmail.com.');
    });
  }

  // 8. Active Nav Link on Scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentSection = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSection = sectionId;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });
});
