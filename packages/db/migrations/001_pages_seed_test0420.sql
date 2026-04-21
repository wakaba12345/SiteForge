-- ============================================
-- Seed: rich /about demo page for test0420 showcasing all block types
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
    'description', '超過十年法律實務經驗，深耕企業法務、詐騙追償與勞資爭議，用專業與溫度守護每一位客戶的權益。'
  ),
  jsonb_build_array(
    jsonb_build_object('type', 'hero', 'config', jsonb_build_object(
      'eyebrow', 'ABOUT US',
      'title', '為每一位客戶守護應得的權益',
      'subtitle', '我們相信，好的法律服務不是冰冷的條文堆疊，而是站在你這一邊、聽懂你的困境、陪你一路走到最後。十年來，我們協助超過 500 家企業與個人取回屬於自己的公道。',
      'align', 'center'
    )),

    jsonb_build_object('type', 'stats', 'config', jsonb_build_object(
      'eyebrow', 'BY THE NUMBERS',
      'heading', '數字背後，是每一個被我們守護的故事',
      'items', jsonb_build_array(
        jsonb_build_object('value', '10', 'suffix', '+', 'label', '年實務經驗'),
        jsonb_build_object('value', '500', 'suffix', '+', 'label', '服務客戶數'),
        jsonb_build_object('value', '87', 'suffix', '%', 'label', '案件勝訴率'),
        jsonb_build_object('value', '2.3', 'suffix', '億', 'label', '協助追回金額')
      )
    )),

    jsonb_build_object('type', 'text', 'config', jsonb_build_object(
      'eyebrow', 'OUR STORY',
      'heading', '從一間只有三個人的工作室，到被信任的法律夥伴',
      'body', '<p>2015 年，我們從大安區一間不到十坪的辦公室開始。三位律師、一張老會議桌、一個共同信念——<strong>法律不該是少數人的武器，而是每個人都該擁有的盾牌</strong>。</p><p>十年來，我們處理過從跨國企業併購、到勞資爭議個案、再到近年最棘手的投資詐騙追償，累積超過 2,000 件實戰經驗。我們拒絕用話術包裝，拒絕把複雜留給客戶。每一次接案，我們都當成是自己家人的事來辦。</p><p>今天，我們已是一支十八人的團隊，但不變的是——每一位客戶，都由主持律師親自關心案件進度。這是我們的堅持，也是我們對每一份信任的回應。</p>',
      'narrow', true,
      'align', 'left'
    )),

    jsonb_build_object('type', 'two_column', 'config', jsonb_build_object(
      'eyebrow', 'OUR MISSION',
      'heading', '讓法律成為弱勢者手中的燈',
      'body', '<p>太多人在遭遇不公時，第一個念頭是「算了」——因為覺得請律師很貴、流程很複雜、勝算不大。</p><p>我們存在的目的，就是要改變這件事。我們用透明的收費、清楚的進度回報、以及成功收費優先的制度，讓每一個值得被伸張的正義，都有機會被看見。</p>',
      'imagePosition', 'right',
      'ctaText', '了解我們的服務',
      'ctaUrl', '/'
    )),

    jsonb_build_object('type', 'team_grid', 'config', jsonb_build_object(
      'eyebrow', 'OUR TEAM',
      'heading', '為你而戰的團隊',
      'intro', '每一位律師都有自己的專業戰場，合在一起，就是你最強的後盾。',
      'columns', 4,
      'members', jsonb_build_array(
        jsonb_build_object('name', '陳志明', 'title', '主持律師 / 創辦人', 'bio', '執業 18 年，前地檢署主任檢察官，專精企業法務與刑事辯護。'),
        jsonb_build_object('name', '林雅婷', 'title', '合夥律師', 'bio', '勞資爭議專家，曾任勞動部顧問，處理逾 300 件勞資調解案件。'),
        jsonb_build_object('name', '張柏翰', 'title', '合夥律師', 'bio', '詐騙追償專家，專攻金融、虛擬貨幣詐騙案件民事追償。'),
        jsonb_build_object('name', '黃怡君', 'title', '資深律師', 'bio', '婚姻家事領域，以同理心陪伴每一位客戶度過人生最艱難的階段。')
      )
    )),

    jsonb_build_object('type', 'features_grid', 'config', jsonb_build_object(
      'eyebrow', 'OUR VALUES',
      'heading', '我們的四個堅持',
      'intro', '不是每一件案子我們都接，但接下的每一件，我們都用盡全力。',
      'columns', 4,
      'items', jsonb_build_array(
        jsonb_build_object('title', '透明計費', 'description', '所有費用於委任前明確揭露，絕無隱藏條款。每一筆支出都開立發票，客戶隨時可查閱費用明細。'),
        jsonb_build_object('title', '主持律師親辦', 'description', '每一件委任案都由主持律師親自把關，不外包、不丟給助理，確保每一次判斷都來自最深的經驗。'),
        jsonb_build_object('title', '48 小時回覆', 'description', '任何委任客戶的法律疑問，保證 48 小時內收到專人回覆。急案開設緊急熱線，24 小時不關機。'),
        jsonb_build_object('title', '成功收費優先', 'description', '詐騙追償案件採「取回後再收費」制度，讓受害者不用再承擔第二次的經濟負擔。')
      )
    )),

    jsonb_build_object('type', 'testimonials', 'config', jsonb_build_object(
      'eyebrow', 'CLIENT VOICES',
      'heading', '客戶怎麼說',
      'columns', 3,
      'items', jsonb_build_array(
        jsonb_build_object(
          'quote', '去年被詐騙 600 萬以為這輩子就這樣了，陳律師完全沒收我先期費用，半年後幫我追回了 520 萬。這不只是一筆錢，是我重新站起來的機會。',
          'author', '王先生',
          'role', '受害者',
          'company', '投資詐騙案'
        ),
        jsonb_build_object(
          'quote', '我們是中小企業，一次員工集體罷工讓我整個人崩潰。林律師不只幫我處理法律面，還教我怎麼和員工重新建立信任，現在回頭看真的很感謝。',
          'author', '李總',
          'role', '總經理',
          'company', '製造業'
        ),
        jsonb_build_object(
          'quote', '離婚本來是我這輩子最痛苦的事，黃律師從第一次諮詢開始就告訴我：她站在我這邊。整個過程她陪我面對每一個細節，讓我重新找回尊嚴。',
          'author', 'A 小姐',
          'role', '',
          'company', '家事案件'
        )
      )
    )),

    jsonb_build_object('type', 'faq', 'config', jsonb_build_object(
      'eyebrow', 'COMMON QUESTIONS',
      'heading', '常見疑問',
      'intro', '在委任之前，你可能也想問這些問題。',
      'items', jsonb_build_array(
        jsonb_build_object('question', '第一次諮詢要收費嗎？', 'answer', '<p>不用。我們提供 30 分鐘免費諮詢，讓你清楚了解案件走向、可能方案與大致費用後，再決定是否委任。</p>'),
        jsonb_build_object('question', '律師費大概怎麼計算？', 'answer', '<p>依案件類型不同，一般採三種計費方式：<br>1. <strong>按件計酬</strong>（勞資、家事、刑事）<br>2. <strong>按時計酬</strong>（企業顧問）<br>3. <strong>成功報酬</strong>（詐騙追償、債權追償）<br>所有費用於委任前白紙黑字清楚載明。</p>'),
        jsonb_build_object('question', '我的案子勝算不高，你們還會接嗎？', 'answer', '<p>我們不會只挑好打的案子。每一次初步諮詢後，我們都會據實告知勝算與風險。若案件確實困難但仍有機會，我們會和你一起討論策略，並讓你自行決定。</p>'),
        jsonb_build_object('question', '案件進行中我隨時可以找到律師嗎？', 'answer', '<p>可以。每位委任客戶都有專屬的聯絡窗口，重要案件另配有 24 小時緊急熱線。我們承諾 48 小時內必回覆。</p>'),
        jsonb_build_object('question', '你們接外縣市案件嗎？', 'answer', '<p>接。全台灣皆可服務，我們在台北、台中、高雄皆設有合作辦公室，視案件需要安排律師到場。視訊諮詢也完全支援。</p>')
      )
    )),

    jsonb_build_object('type', 'cta', 'config', jsonb_build_object(
      'title', '準備好讓法律成為你的後盾了嗎',
      'description', '第一次諮詢完全免費，30 分鐘了解您的狀況，無任何費用承諾。無論是企業法務、詐騙追償還是勞資爭議，我們都在這裡。',
      'buttonText', '預約免費諮詢',
      'buttonUrl', '/contact'
    ))
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

-- ============================================
-- /services page — showcases process_steps + cases_grid + gallery
-- ============================================

WITH target AS (
  SELECT id FROM sites WHERE slug = 'test0420' LIMIT 1
)
INSERT INTO pages (site_id, slug, title, nav_label, seo, sections, sort_order, is_published, show_in_nav)
SELECT
  target.id,
  'services',
  '服務項目',
  '服務項目',
  jsonb_build_object(
    'title', '服務項目 | test0420',
    'description', '專精於企業法務、詐騙追償、勞資爭議、婚姻家事——用最懂你的專業，解決你的難題。'
  ),
  jsonb_build_array(
    jsonb_build_object('type', 'hero', 'config', jsonb_build_object(
      'eyebrow', 'OUR SERVICES',
      'title', '每一個專業領域，都有我們最懂你的律師',
      'subtitle', '我們不是一間什麼都接的事務所，而是把每個領域都做到最深。你的問題，值得遇到真正在這裡深耕多年的人。',
      'align', 'center'
    )),

    jsonb_build_object('type', 'process_steps', 'config', jsonb_build_object(
      'eyebrow', 'HOW WE WORK',
      'heading', '合作這樣開始，不複雜',
      'intro', '從第一通電話到結案，每一步都清楚透明。',
      'items', jsonb_build_array(
        jsonb_build_object('title', '免費諮詢', 'description', '30 分鐘初步了解，給你明確方向與費用估算，無任何負擔。'),
        jsonb_build_object('title', '策略擬定', 'description', '評估案件並提出多套方案，由你選擇最符合需求的策略。'),
        jsonb_build_object('title', '簽約委任', 'description', '白紙黑字明確載明服務範圍、費用、時程，絕無隱藏條款。'),
        jsonb_build_object('title', '執行結案', 'description', '定期進度回報，透明追蹤，主持律師全程親自把關。')
      )
    )),

    jsonb_build_object('type', 'cases_grid', 'config', jsonb_build_object(
      'eyebrow', 'SUCCESS STORIES',
      'heading', '我們最自豪的幾個案例',
      'intro', '每一件案子都有不同的挑戰，但我們都用同樣的認真面對。',
      'columns', 3,
      'items', jsonb_build_array(
        jsonb_build_object(
          'title', '協助上市科技公司處理跨國商標侵權',
          'client', 'TECH 產業',
          'description', '客戶在東南亞遭遇商標仿冒與惡意搶註，需跨越三國司法程序，協調當地律師團隊處理民事、刑事雙軌追訴。',
          'results', '一年內取得三國勝訴判決，商標全數收回',
          'tags', jsonb_build_array('智慧財產', '跨國訴訟', '企業法務')
        ),
        jsonb_build_object(
          'title', '虛擬貨幣詐騙集團追償 8,500 萬',
          'client', '個人受害者集體委任',
          'description', '27 位受害者遭同一集團詐騙，主嫌在海外，透過金流追查、扣押在台資產，進行民事假扣押與刑事告訴。',
          'results', '半年內追回 72% 受害金額',
          'tags', jsonb_build_array('詐騙追償', '民事追償', '集體訴訟')
        ),
        jsonb_build_object(
          'title', '中型製造業勞資爭議調解',
          'client', '製造業',
          'description', '員工因調薪爭議集體申訴，公司營運瀕臨停擺。介入雙方溝通，設計分階段調薪方案並重建信任機制。',
          'results', '兩週內完成調解，零訴訟結案',
          'tags', jsonb_build_array('勞資爭議', '企業調解')
        )
      )
    )),

    jsonb_build_object('type', 'gallery', 'config', jsonb_build_object(
      'eyebrow', 'OUR OFFICE',
      'heading', '走進我們的空間',
      'intro', '相信一個事務所的氣質，從空間就看得出來。',
      'columns', 3,
      'images', jsonb_build_array(
        jsonb_build_object('url', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', 'alt', '接待大廳', 'caption', '接待大廳'),
        jsonb_build_object('url', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80', 'alt', '會議室', 'caption', '主會議室'),
        jsonb_build_object('url', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80', 'alt', '辦公區', 'caption', '律師工作區'),
        jsonb_build_object('url', 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80', 'alt', '諮詢室', 'caption', '客戶諮詢室'),
        jsonb_build_object('url', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80', 'alt', '書庫', 'caption', '法律書庫'),
        jsonb_build_object('url', 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&q=80', 'alt', '休憩區', 'caption', '客戶休憩區')
      )
    )),

    jsonb_build_object('type', 'cta', 'config', jsonb_build_object(
      'title', '不知道該從哪個服務開始嗎',
      'description', '告訴我們你的狀況，我們會幫你找到最對的律師、最適合的策略。',
      'buttonText', '免費諮詢',
      'buttonUrl', '/contact'
    ))
  ),
  1,
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

-- ============================================
-- /contact page — showcases contact_form block
-- ============================================

WITH target AS (
  SELECT id FROM sites WHERE slug = 'test0420' LIMIT 1
)
INSERT INTO pages (site_id, slug, title, nav_label, seo, sections, sort_order, is_published, show_in_nav)
SELECT
  target.id,
  'contact',
  '聯絡我們',
  '聯絡我們',
  jsonb_build_object(
    'title', '聯絡我們 | test0420',
    'description', '無論是企業法務、詐騙追償、還是人生的難題，寫下來我們就會回覆。'
  ),
  jsonb_build_array(
    jsonb_build_object('type', 'hero', 'config', jsonb_build_object(
      'eyebrow', 'GET IN TOUCH',
      'title', '先告訴我們你遇到了什麼',
      'subtitle', '30 分鐘初步諮詢完全免費。不管你準備好了沒，都可以先聊聊。',
      'align', 'center'
    )),

    jsonb_build_object('type', 'contact_form', 'config', jsonb_build_object(
      'eyebrow', 'TELL US MORE',
      'heading', '留下訊息，我們 48 小時內回覆',
      'intro', '所有訊息都經過嚴格保密，你的故事只有承辦律師會看到。',
      'fields', jsonb_build_array('name', 'email', 'phone', 'company', 'message'),
      'submitText', '送出訊息',
      'successMessage', '訊息已收到，主持律師會在 48 小時內親自回覆您。'
    ))
  ),
  2,
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
