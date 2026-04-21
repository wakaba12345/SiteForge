-- ============================================
-- Seed: insert a demo /about page for test0420
-- Run after 001_pages.sql. Safe to re-run (ON CONFLICT DO UPDATE).
-- ============================================

WITH target AS (
  SELECT id FROM sites WHERE slug = 'test0420' LIMIT 1
)
INSERT INTO pages (site_id, slug, title, nav_label, seo, sections, sort_order, is_published, show_in_nav)
SELECT
  target.id,
  'about',
  '關於我們',
  '關於我們',
  jsonb_build_object(
    'title', '關於我們 | test0420',
    'description', '超過十年的法律實務經驗，深耕企業法務、詐騙追償與勞資爭議，用專業與溫度守護每一位客戶的權益。'
  ),
  jsonb_build_array(
    jsonb_build_object(
      'type', 'hero',
      'config', jsonb_build_object(
        'eyebrow', 'ABOUT US',
        'title', '為每一位客戶守護應得的權益',
        'subtitle', '我們相信，好的法律服務不是冰冷的條文堆疊，而是站在你這一邊、聽懂你的困境、陪你一路走到最後。十年來，我們協助超過 500 家企業與個人取回屬於自己的公道。',
        'align', 'center'
      )
    ),
    jsonb_build_object(
      'type', 'text',
      'config', jsonb_build_object(
        'eyebrow', 'OUR STORY',
        'heading', '從一間只有三個人的工作室，到被信任的法律夥伴',
        'body', '<p>2015 年，我們從大安區一間不到十坪的辦公室開始。三位律師、一張老會議桌、一個共同信念——<strong>法律不該是少數人的武器，而是每個人都該擁有的盾牌</strong>。</p><p>十年來，我們處理過從跨國企業併購、到勞資爭議個案、再到近年最棘手的投資詐騙追償，累積超過 2,000 件實戰經驗。我們拒絕用話術包裝，拒絕把複雜留給客戶。每一次接案，我們都當成是自己家人的事來辦。</p><p>今天，我們已是一支十八人的團隊，但不變的是——每一位客戶，都由主持律師親自關心案件進度。這是我們的堅持，也是我們對每一份信任的回應。</p>',
        'narrow', true,
        'align', 'left'
      )
    ),
    jsonb_build_object(
      'type', 'features_grid',
      'config', jsonb_build_object(
        'eyebrow', 'OUR VALUES',
        'heading', '我們的四個堅持',
        'intro', '不是每一件案子我們都接，但接下的每一件，我們都用盡全力。',
        'columns', 4,
        'items', jsonb_build_array(
          jsonb_build_object(
            'title', '透明計費',
            'description', '所有費用於委任前明確揭露，絕無隱藏條款。每一筆支出都開立發票，客戶隨時可查閱案件費用明細。'
          ),
          jsonb_build_object(
            'title', '主持律師親辦',
            'description', '每一件委任案都由主持律師親自把關，不外包、不丟給助理，確保每一次判斷都來自最深的經驗與最真的在乎。'
          ),
          jsonb_build_object(
            'title', '48 小時回覆',
            'description', '任何委任客戶的法律疑問，保證 48 小時內收到專人回覆。急案開設緊急熱線，24 小時不關機。'
          ),
          jsonb_build_object(
            'title', '成功收費優先',
            'description', '詐騙追償案件採「取回後再收費」制度，讓受害者不用再承擔第二次的經濟負擔。'
          )
        )
      )
    ),
    jsonb_build_object(
      'type', 'cta',
      'config', jsonb_build_object(
        'title', '準備好讓法律成為你的後盾了嗎',
        'description', '第一次諮詢完全免費，30 分鐘了解您的狀況，無任何費用承諾。無論是企業法務、詐騙追償還是勞資爭議，我們都在這裡。',
        'buttonText', '預約免費諮詢',
        'buttonUrl', '/contact'
      )
    )
  ),
  0,
  TRUE,
  TRUE
FROM target
ON CONFLICT (site_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  nav_label = EXCLUDED.nav_label,
  seo = EXCLUDED.seo,
  sections = EXCLUDED.sections,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  show_in_nav = EXCLUDED.show_in_nav;
