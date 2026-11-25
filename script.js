// Trương Gia Kiệt Portfolio - Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 1.5 Live Studio Clock (Saigon Time GMT+7)
  const clockTimeEl = document.getElementById('studio-clock-time');
  const clockDateEl = document.getElementById('studio-clock-date');
  if (clockTimeEl && clockDateEl) {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const dateStr = now.toLocaleDateString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      clockTimeEl.textContent = timeStr;
      clockDateEl.textContent = dateStr;
    };
    updateClock();
    setInterval(updateClock, 1000);
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

  // 4. Project Modal Data & Lightbox (All crisp images + real GitHub links)
  const projectDetails = {
    'utecoffe': {
      title: 'UTECOFFE — SPECIALTY TEA & COFFEE OMO PLATFORM',
      category: 'ENTERPRISE E-COMMERCE',
      tools: 'Java 21, Spring Boot 3.3.5, PostgreSQL (34 Bảng), WebSocket STOMP, Cloudinary, Docker',
      img: 'assets/utecoffe.png',
      link: 'https://github.com/JiaysTM17/UTECoffe',
      demo: 'https://utecoffe.io.vn',
      desc: 'Đồ án hệ thống website thương mại điện tử chuỗi bán trà & cà phê đặc sản UTECoffe. Tích hợp mô hình OMO (Online-Merge-Offline), quầy Barista KDS cập nhật đơn hàng realtime qua WebSocket STOMP, CSDL 34 bảng quan hệ chuẩn hóa 3NF, 8 thuật toán doanh nghiệp và triển khai thực tế tại tên miền utecoffe.io.vn.'
    },
    'nexora': {
      title: 'NEXORA — NEXT-GEN FASHION MARKETPLACE',
      category: 'FASHION MARKETPLACE',
      tools: 'React.js, Node.js, Express, MongoDB, Tailwind CSS, REST API',
      img: 'assets/nexora.jpg',
      link: 'https://github.com/JiaysTM17/nexora',
      demo: '',
      desc: 'NEXORA là sàn thương mại điện tử thời trang thế hệ mới tích hợp mạng xã hội phong cách OOTD Community, chương trình thu cũ đổi mới Re-Loved Trade-In và nền tảng chăm sóc đồ xa xỉ Luxury VAS Care. Dự án bao gồm bộ nhận diện thương hiệu và tài liệu đặc tả hệ thống bài bản.'
    },
    'fullstack-ecommerce': {
      title: 'FULLSTACK E-COMMERCE PLATFORM',
      category: 'FULLSTACK SYSTEM',
      tools: 'React, Node.js, Express, MongoDB, Jest (3.151 Tests), OWASP Security',
      img: 'assets/project-fullstack.png',
      link: 'https://github.com/JiaysTM17/Fullstack-Ecommerce',
      demo: '',
      desc: 'Hệ thống website bán lẻ trực tuyến hoàn chỉnh đạt tỷ lệ pass test 100% với 3.151 automated tests trong 1.29 giây. Tích hợp két ký quỹ Escrow bảo vệ người mua, hệ thống voucher kép, hóa đơn giá trị gia tăng VAT, theo dõi vận chuyển SPX Logistics và tuân thủ các quy chuẩn bảo mật OWASP.'
    },
    'kiet-assistant': {
      title: 'KIỆT ASSISTANT — AI PORTFOLIO AGENT',
      category: 'AI & LLM AGENT',
      tools: 'Google Gemini API, Node.js, Express, RESTful API, Song ngữ VI/EN',
      img: 'assets/project-ai.png',
      link: 'https://github.com/JiaysTM17/portfolio-assistant-api',
      demo: '',
      desc: 'Dịch vụ API bảo mật cho trợ lý trí tuệ nhân tạo (AI Portfolio Assistant) xây dựng trên nền tảng Google Gemini API. Trợ lý tự động đối chiếu dữ liệu công khai trên GitHub để giải đáp các câu hỏi về học vấn, kỹ năng, dự án và định hướng nghề nghiệp của Trương Gia Kiệt.'
    },
    'task-manager': {
      title: 'TASK MANAGER WEB APPLICATION',
      category: 'WEB APPLICATION',
      tools: 'JavaScript ES6+, HTML5, CSS3 Grid, LocalStorage',
      img: 'assets/project-task.png',
      link: 'https://github.com/JiaysTM17/task-manager',
      demo: '',
      desc: 'Ứng dụng web quản lý công việc cá nhân trực quan. Hỗ trợ tạo tác vụ, phân loại trạng thái, gắn nhãn độ ưu tiên, theo dõi tiến độ hoàn thành và lưu trữ dữ liệu bền vững ngay trên trình duyệt bằng LocalStorage.'
    },
    'ltw-video': {
      title: 'LTW JPA & SITEMESH VIDEO STREAMING SYSTEM',
      category: 'BACKEND ARCHITECTURE',
      tools: 'Spring Boot, Spring Data JPA, Sitemesh 3, PostgreSQL, Bootstrap 5',
      img: 'assets/project-video.png',
      link: 'https://github.com/JiaysTM17/LTW_BT16.11.2026_JPA_Video',
      demo: '',
      desc: 'Hệ thống website quản lý và truyền phát video thuộc học phần Lập trình Web tại trường Đại học Sư phạm Kỹ thuật TP.HCM (HCMUTE). Ứng dụng Spring Boot, Spring Data JPA, phân quyền người dùng và trang trí layout đồng nhất bằng Sitemesh 3.'
    }
  };

  const modal = document.getElementById('project-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalCategory = document.getElementById('modal-category');
  const modalTools = document.getElementById('modal-tools');
  const modalDesc = document.getElementById('modal-desc');
  const modalLink = document.getElementById('modal-link');
  const modalDemo = document.getElementById('modal-demo');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  function openModal(projectId) {
    const data = projectDetails[projectId] || {
      title: 'DỰ ÁN PHẦN MỀM',
      category: 'SOFTWARE PROJECT',
      tools: 'Spring Boot, React, Node.js',
      img: 'assets/utecoffe.png',
      link: 'https://github.com/JiaysTM17',
      demo: '',
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
    if (modalDemo) {
      if (data.demo) {
        modalDemo.href = data.demo;
        modalDemo.classList.remove('hidden');
        modalDemo.classList.add('flex');
      } else {
        modalDemo.classList.add('hidden');
        modalDemo.classList.remove('flex');
      }
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

  // 6. Contact Form Submission (Real mailto trigger + instant confirmation UI)
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value.trim();

      const bodyText = `Họ và tên: ${name}\nEmail: ${email}\nSố điện thoại: ${phone || 'Không có'}\n\nNội dung:\n${message}`;
      const mailtoUrl = `mailto:truonggiakiet110806@gmail.com?subject=${encodeURIComponent('[Portfolio Contact] ' + subject)}&body=${encodeURIComponent(bodyText)}`;

      window.location.href = mailtoUrl;

      contactForm.reset();
      if (formSuccess) {
        formSuccess.classList.remove('hidden');
        setTimeout(() => {
          formSuccess.classList.add('hidden');
        }, 7000);
      }
    });
  }

  // 7. Interactive Resume Modal
  const downloadCvBtn = document.getElementById('download-cv-btn');
  const resumeModal = document.getElementById('resume-modal');
  const resumeCloseBtn = document.getElementById('resume-close-btn');

  if (downloadCvBtn && resumeModal) {
    downloadCvBtn.addEventListener('click', () => {
      resumeModal.classList.remove('hidden');
      resumeModal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    });

    const closeResume = () => {
      resumeModal.classList.add('hidden');
      resumeModal.classList.remove('flex');
      document.body.style.overflow = '';
    };

    if (resumeCloseBtn) {
      resumeCloseBtn.addEventListener('click', closeResume);
    }

    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) {
        closeResume();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !resumeModal.classList.contains('hidden')) {
        closeResume();
      }
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
