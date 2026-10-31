import os, sys, math, time, subprocess
import cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WIDTH, HEIGHT = 720, 1280
FPS = 30
TOTAL_FRAMES = 900 # 30.0 seconds

# Typography Setup
FONT_TITLE_BOLD = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 46)
FONT_HEADING = ImageFont.truetype("/System/Library/Fonts/Supplemental/Futura.ttc", 36)
FONT_BODY_BOLD = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 26)
FONT_BODY = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 22)
FONT_SMALL = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 18)
FONT_MONO = ImageFont.truetype("/System/Library/Fonts/Supplemental/Courier New Bold.ttf", 22)
FONT_HINDI_TITLE = ImageFont.truetype("/System/Library/Fonts/Supplemental/DevanagariMT.ttc", 34)
FONT_HINDI_SUB = ImageFont.truetype("/System/Library/Fonts/Supplemental/DevanagariMT.ttc", 26)

# Assets
LOGO_IMG = Image.open("public/images/branding/prepzii-logo-light.png").convert("RGBA")
FAVICON_IMG = Image.open("public/images/branding/favicon-192x192.png").convert("RGBA")
FORMULA_CARD_IMG = Image.open("public/images/formula-cards/math/nature-of-roots-flowchart.png").convert("RGBA")

# Color Palette
BG_DARK = (11, 15, 25)
BG_CARD = (20, 27, 45)
BG_CARD_LIGHT = (28, 38, 64)
BORDER_COLOR = (45, 58, 92)
GOLD = (244, 180, 0)
GOLD_LIGHT = (255, 215, 64)
CYAN = (0, 240, 255)
PURPLE = (168, 85, 247)
GREEN = (34, 197, 94)
RED = (239, 68, 68)
WHITE = (255, 255, 255)
GRAY = (148, 163, 184)
GRAY_DARK = (100, 116, 139)

def draw_rounded_card(draw, bbox, radius=18, fill=BG_CARD, outline=BORDER_COLOR, width=2):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)

def draw_ambient_glow(img, center_x, center_y, radius, color, alpha=40):
    # Fast radial glow overlay
    glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow)
    bbox = [center_x - radius, center_y - radius, center_x + radius, center_y + radius]
    g_draw.ellipse(bbox, fill=(color[0], color[1], color[2], alpha))
    glow = glow.filter(ImageFilter.GaussianBlur(radius // 2))
    img.alpha_composite(glow)

def draw_cursor(draw, x, y, clicked=False):
    # Sleek macOS / modern cursor
    pts = [(x, y), (x, y + 26), (x + 6, y + 21), (x + 13, y + 28), (x + 17, y + 25), (x + 10, y + 17), (x + 18, y + 17)]
    fill = (255, 255, 255) if not clicked else GOLD
    draw.polygon(pts, fill=fill, outline=(0, 0, 0))
    if clicked:
        # Ripple ring
        draw.ellipse([x - 14, y - 14, x + 14, y + 14], outline=(244, 180, 0), width=3)

def draw_subtitles(draw, hindi_text, english_tag):
    # Kinetic Subtitle Pill at bottom of screen
    box = [50, 1110, WIDTH - 50, 1210]
    draw.rounded_rectangle(box, radius=20, fill=(15, 23, 42, 230), outline=(51, 65, 85), width=2)
    # Tag
    draw.text((70, 1122), english_tag.upper(), font=FONT_SMALL, fill=GOLD)
    # Hindi Text
    draw.text((70, 1150), hindi_text, font=FONT_HINDI_TITLE, fill=WHITE)

def render_scene_1(frame_idx):
    # Scene 1: Frames 0 - 165 (0.0s - 5.5s)
    # Hook: The Aspirant Dilemma (Outdated Books, Messy Telegrams, Stuck at 110/300)
    p = frame_idx / 165.0
    img = Image.new("RGBA", (WIDTH, HEIGHT), BG_DARK)
    
    # Ambient Red / Orange Warning Glow
    draw_ambient_glow(img, WIDTH // 2, 450, 280, RED, alpha=35)
    draw = ImageDraw.Draw(img)

    # Top Alert Badge (flashing)
    flash = int(128 + 127 * math.sin(frame_idx * 0.3))
    alert_bg = (239, 68, 68, min(255, flash + 60))
    draw.rounded_rectangle([70, 90, WIDTH - 70, 145], radius=28, fill=(35, 15, 20), outline=RED, width=2)
    draw.text((120, 102), "⚠️  JEE / NEET ASPIRANT REALITY CHECK", font=FONT_BODY_BOLD, fill=(255, 200, 200))

    # Main Headline with Spring Scale
    scale = min(1.0, p * 4.0)
    draw.text((60, 180), "STUCK AT 110", font=FONT_TITLE_BOLD, fill=WHITE)
    draw.text((60, 238), "IN MOCK TESTS?", font=FONT_TITLE_BOLD, fill=RED)

    # Big Frustration Meter Card
    card_box = [60, 320, WIDTH - 60, 680]
    draw_rounded_card(draw, card_box, radius=24, fill=(18, 22, 34), outline=(75, 25, 30), width=2)

    # Meter dial arc
    shake_x = int(math.sin(frame_idx * 1.2) * 4) if frame_idx > 30 else 0
    draw.text((card_box[0] + 40 + shake_x, card_box[1] + 35), "NTA CBT MOCK SCORE", font=FONT_SMALL, fill=GRAY)
    
    # Score Dial Number (shaking anxiously)
    draw.text((card_box[0] + 40 + shake_x, card_box[1] + 75), "110", font=ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 96), fill=RED)
    draw.text((card_box[0] + 230 + shake_x, card_box[1] + 130), "/ 300 Marks", font=FONT_BODY_BOLD, fill=GRAY)

    # Red Progress bar stuck at ~36%
    bar_box = [card_box[0] + 40, card_box[1] + 205, card_box[1] + 560, card_box[1] + 230]
    draw.rounded_rectangle([card_box[0] + 40, card_box[1] + 205, card_box[0] + 560, card_box[1] + 225], radius=10, fill=(35, 40, 55))
    draw.rounded_rectangle([card_box[0] + 40, card_box[1] + 205, card_box[0] + 40 + int(520 * 0.36), card_box[1] + 225], radius=10, fill=RED)
    draw.text((card_box[0] + 40, card_box[1] + 240), "Percentile: ~78.4% (Qualifying Cutoff Missed)", font=FONT_SMALL, fill=(248, 113, 113))

    # STAMP: "SCORE STAGNANT" slamming down at frame 45
    if frame_idx >= 40:
        stamp_p = min(1.0, (frame_idx - 40) / 8.0)
        stamp_box = [card_box[0] + 160, card_box[1] + 120, card_box[0] + 520, card_box[1] + 185]
        draw.rectangle(stamp_box, fill=(220, 38, 38, 230), outline=(255, 255, 255), width=3)
        draw.text((stamp_box[0] + 22, stamp_box[1] + 14), "STAGNANT SCORE!", font=FONT_BODY_BOLD, fill=WHITE)

    # Two Pain Point Warning Pills
    # 1. 15-Year Old PDFs
    off1 = min(1.0, max(0.0, (frame_idx - 60) / 15.0))
    x1 = int(60 + (1.0 - off1) * 300)
    draw.rounded_rectangle([x1, 720, x1 + 590, 795], radius=16, fill=BG_CARD, outline=(80, 35, 40), width=2)
    draw.text((x1 + 25, 735), "❌ 15-Year Old Outdated Hardcopy Books", font=FONT_BODY_BOLD, fill=(255, 220, 220))
    draw.text((x1 + 60, 765), "Irrelevant old patterns with zero real CBT timing", font=FONT_SMALL, fill=GRAY)

    # 2. 10+ Chaotic Telegrams
    off2 = min(1.0, max(0.0, (frame_idx - 90) / 15.0))
    x2 = int(60 - (1.0 - off2) * 300)
    draw.rounded_rectangle([x2, 820, x2 + 590, 895], radius=16, fill=BG_CARD, outline=(80, 35, 40), width=2)
    draw.text((x2 + 25, 835), "❌ 10+ Cluttered Telegram Channels", font=FONT_BODY_BOLD, fill=(255, 220, 220))
    draw.text((x2 + 60, 865), "Wasting 2 hours daily searching unverified PDF answers", font=FONT_SMALL, fill=GRAY)

    # Subtitles
    if frame_idx < 80:
        draw_subtitles(draw, "भाई सच बता... तू भी 15 साल पुरानी किताबों में भटक रहा है?", "JEE / NEET Dilemma")
    else:
        draw_subtitles(draw, "पढ़ तो सब लिया, पर मॉक टेस्ट स्कोर अभी भी 110 पे अटका है!", "Mock Test Plateau")

    return img

def render_scene_2(frame_idx):
    # Scene 2: Frames 165 - 330 (5.5s - 11.0s)
    # The Fix: Switch to PrepZii, 10,000+ Authentic NTA PYQs on Real CBT Screen
    f_rel = frame_idx - 165
    p = f_rel / 165.0
    img = Image.new("RGBA", (WIDTH, HEIGHT), BG_DARK)
    
    # Ambient Gold / Cyan Glow
    draw_ambient_glow(img, WIDTH // 2, 400, 300, GOLD, alpha=30)
    draw = ImageDraw.Draw(img)

    # Top Brand Bar with PrepZii Logo
    logo_w = 200
    logo_h = int(LOGO_IMG.height * (logo_w / LOGO_IMG.width))
    logo_resized = LOGO_IMG.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    img.alpha_composite(logo_resized, (60, 60))

    # Badge on right
    draw.rounded_rectangle([WIDTH - 240, 70, WIDTH - 60, 115], radius=22, fill=(30, 41, 59), outline=CYAN, width=2)
    draw.text((WIDTH - 215, 82), "⚡ CBT ENGINE", font=FONT_BODY_BOLD, fill=CYAN)

    # Punchy Heading
    draw.text((60, 145), "TIME WASTE MAT KARO!", font=FONT_TITLE_BOLD, fill=WHITE)
    draw.text((60, 200), "10,000+ REAL NTA CBT PYQS", font=FONT_HEADING, fill=GOLD)

    # CBT Interface Container (Glassmorphism card)
    cbt_box = [45, 265, WIDTH - 45, 940]
    draw_rounded_card(draw, cbt_box, radius=20, fill=(16, 22, 36), outline=BORDER_COLOR, width=2)

    # CBT Top Navigation Header
    draw.rounded_rectangle([cbt_box[0], cbt_box[1], cbt_box[2], cbt_box[1] + 65], radius=20, fill=(24, 32, 52))
    draw.text((cbt_box[0] + 25, cbt_box[1] + 18), "JEE Main 2024 (Jan Shift-1) • Physics", font=FONT_BODY_BOLD, fill=WHITE)
    
    # CBT Countdown Clock
    secs_left = max(0, 10800 - int(frame_idx * 4))
    m, s = divmod(secs_left, 60)
    h, m = divmod(m, 60)
    draw.text((cbt_box[2] - 170, cbt_box[1] + 18), f"⏱️ {h:02d}:{m:02d}:{s:02d}", font=FONT_MONO, fill=GOLD)

    # Question Meta bar
    draw.text((cbt_box[0] + 25, cbt_box[1] + 85), "Question 14 of 30", font=FONT_SMALL, fill=GRAY)
    draw.text((cbt_box[0] + 25, cbt_box[1] + 110), "Single Correct • (+4, -1 Mark)", font=FONT_SMALL, fill=CYAN)

    # Authentic Physics Question Text
    draw.text((cbt_box[0] + 25, cbt_box[1] + 150), "A satellite of mass m orbits Earth of mass M", font=FONT_BODY_BOLD, fill=WHITE)
    draw.text((cbt_box[0] + 25, cbt_box[1] + 185), "in a circular orbit of radius R. The total energy", font=FONT_BODY_BOLD, fill=WHITE)
    draw.text((cbt_box[0] + 25, cbt_box[1] + 220), "of the satellite is given by:", font=FONT_BODY_BOLD, fill=WHITE)

    # Options A, B, C, D
    options = [
        ("A", "E = - GMm / R", False),
        ("B", "E = - GMm / (2R)", True), # Target option!
        ("C", "E = + GMm / (2R)", False),
        ("D", "E = - 2GMm / R", False)
    ]

    # Cursor animation: Swoops in starting at frame 200, clicks at frame 245
    clicked = f_rel >= 80
    cursor_x = 100 + int(min(1.0, max(0.0, (f_rel - 35) / 45.0)) * 260)
    cursor_y = 700 - int(math.sin(min(1.0, max(0.0, (f_rel - 35) / 45.0)) * math.pi) * 120) - int(min(1.0, max(0.0, (f_rel - 35) / 45.0)) * 220)

    for i, (label, text, is_correct) in enumerate(options):
        oy = cbt_box[1] + 280 + i * 85
        obox = [cbt_box[0] + 25, oy, cbt_box[2] - 180, oy + 70]
        
        is_selected = is_correct and clicked
        bg = (20, 45, 30) if is_selected else (22, 30, 48)
        border = GREEN if is_selected else BORDER_COLOR
        txt_col = GREEN if is_selected else WHITE
        
        draw.rounded_rectangle(obox, radius=14, fill=bg, outline=border, width=2 if not is_selected else 3)
        draw.text((obox[0] + 20, oy + 18), f"({label})", font=FONT_BODY_BOLD, fill=txt_col)
        draw.text((obox[0] + 75, oy + 18), text, font=FONT_BODY_BOLD, fill=WHITE if not is_selected else (220, 255, 220))
        if is_selected:
            draw.text((obox[2] - 45, oy + 18), "✓", font=FONT_BODY_BOLD, fill=GREEN)

    # Right side CBT Palette Grid
    palette_x = cbt_box[2] - 145
    draw.text((palette_x, cbt_box[1] + 85), "PALETTE", font=FONT_SMALL, fill=GRAY)
    for row in range(5):
        for col in range(2):
            q_num = row * 2 + col + 11
            qx = palette_x + col * 48
            qy = cbt_box[1] + 120 + row * 48
            is_q14 = (q_num == 14)
            q_bg = GREEN if (is_q14 and clicked) or q_num < 14 else (40, 50, 75)
            draw.rounded_rectangle([qx, qy, qx + 40, qy + 40], radius=8, fill=q_bg)
            draw.text((qx + 10, qy + 10), str(q_num), font=FONT_SMALL, fill=WHITE)

    # Bottom Stat banner
    draw.rounded_rectangle([60, 960, WIDTH - 60, 1040], radius=18, fill=(30, 41, 59), outline=GOLD, width=2)
    draw.text((85, 980), "🎯  10,000+ REAL NTA PAPERS (2010 - 2024)", font=FONT_BODY_BOLD, fill=GOLD_LIGHT)
    draw.text((85, 1010), "Full NTA CBT Interface with Live Marking Scheme", font=FONT_SMALL, fill=WHITE)

    # Render mouse cursor over Option B
    if f_rel > 30:
        draw_cursor(draw, cursor_x, cursor_y, clicked=clicked and f_rel < 110)

    # Subtitles
    if f_rel < 75:
        draw_subtitles(draw, "टाइम वेस्ट करना बंद करो! स्विच करो PrepZii पर!", "Stop Wasting Time")
    else:
        draw_subtitles(draw, "10,000 से ज्यादा असली PYQs, बिल्कुल असली CBT स्क्रीन पर!", "Real CBT Exam Simulation")

    return img

def render_scene_3(frame_idx):
    # Scene 3: Frames 330 - 495 (11.0s - 16.5s)
    # Zi AI Doubt Solver: Step-by-Step Formula & Concept Breakdown
    f_rel = frame_idx - 330
    p = f_rel / 165.0
    img = Image.new("RGBA", (WIDTH, HEIGHT), BG_DARK)
    
    # Ambient Purple / Indigo AI Glow
    draw_ambient_glow(img, WIDTH // 2, 500, 320, PURPLE, alpha=35)
    draw = ImageDraw.Draw(img)

    # Top Header
    draw.rounded_rectangle([60, 70, WIDTH - 60, 125], radius=24, fill=(35, 20, 60), outline=PURPLE, width=2)
    draw.text((100, 84), "✨  ZI AI: INSTANT 24/7 PERSONAL TUTOR", font=FONT_BODY_BOLD, fill=(230, 200, 255))

    draw.text((60, 150), "KATHIN SAWAAL MEIN PHANSE?", font=FONT_TITLE_BOLD, fill=WHITE)
    draw.text((60, 205), "NO 40-MIN YOUTUBE SEARCHES", font=FONT_HEADING, fill=(216, 180, 254))

    # Center Mock Screen with Zi AI Modal
    main_box = [45, 270, WIDTH - 45, 1020]
    draw_rounded_card(draw, main_box, radius=24, fill=(17, 24, 39), outline=(90, 50, 130), width=2)

    # Top Mini Question
    draw.text((75, 295), "Doubt on JEE Adv 2023: Rotational Dynamics", font=FONT_SMALL, fill=GRAY)
    draw.text((75, 325), "\"Find angular velocity when mass m attaches to ring...\"", font=FONT_BODY_BOLD, fill=(203, 213, 225))

    # Zi AI Launch Button (Glowing gradient effect)
    btn_box = [75, 370, WIDTH - 75, 435]
    draw.rounded_rectangle(btn_box, radius=16, fill=(126, 34, 206), outline=(192, 132, 252), width=2)
    draw.text((120, 388), "✨  Zi AI Breakdown Activated  (0.2s)", font=FONT_BODY_BOLD, fill=WHITE)

    # Breakdown Steps appearing progressively
    # Step 1 at f_rel >= 20
    # Step 2 at f_rel >= 55
    # Step 3 at f_rel >= 90
    steps = [
        ("STEP 1: Conservation of Angular Momentum", "External torque about central axis = 0. Therefore Li = Lf", (192, 132, 252)),
        ("STEP 2: Moment of Inertia Calculation", "I_initial = MR²  ==>  I_final = (M + 2m)R²", (147, 197, 253)),
        ("STEP 3: Substitute & Solve Final Velocity", "ω_final = [ M / (M + 2m) ] · ω_initial  =  14.2 rad/s", GREEN)
    ]

    for i, (title, formula, color) in enumerate(steps):
        trigger = 20 + i * 35
        if f_rel >= trigger:
            sy = 465 + i * 145
            sbox = [75, sy, WIDTH - 75, sy + 125]
            draw.rounded_rectangle(sbox, radius=16, fill=(24, 32, 52), outline=color, width=2)
            draw.text((sbox[0] + 20, sy + 18), title, font=FONT_BODY_BOLD, fill=color)
            draw.text((sbox[0] + 20, sy + 58), formula, font=FONT_MONO if i > 0 else FONT_BODY, fill=WHITE)
            # Verified checkmark
            draw.text((sbox[2] - 45, sy + 18), "✓", font=FONT_BODY_BOLD, fill=color)

    # Bottom Highlight Card
    draw.rounded_rectangle([75, 915, WIDTH - 75, 990], radius=18, fill=(30, 20, 50), outline=GOLD, width=2)
    draw.text((100, 935), "⚡ Instant Step-by-Step Proofs in < 3 Sec", font=FONT_BODY_BOLD, fill=GOLD)
    draw.text((100, 962), "Trained specifically on NTA JEE & NEET solutions", font=FONT_SMALL, fill=WHITE)

    # Subtitles
    if f_rel < 75:
        draw_subtitles(draw, "कठिन सवाल में फंस गए? घंटों यूट्यूब मत ढूंढो!", "Stuck on a Hard Problem?")
    else:
        draw_subtitles(draw, "बस टैप करो Zi AI! स्टेप-बाय-स्टेप तरीका तुरंत क्लियर!", "Instant Zi AI Solutions")

    return img

def render_scene_4(frame_idx):
    # Scene 4: Frames 495 - 660 (16.5s - 22.0s)
    # Digital Formula Cards & Weak Chapter AI Analytics
    f_rel = frame_idx - 495
    p = f_rel / 165.0
    img = Image.new("RGBA", (WIDTH, HEIGHT), BG_DARK)
    
    # Ambient Cyan / Green Glow
    draw_ambient_glow(img, WIDTH // 2, 450, 300, CYAN, alpha=30)
    draw = ImageDraw.Draw(img)

    # Top Header
    draw.rounded_rectangle([60, 70, WIDTH - 60, 125], radius=24, fill=(15, 35, 45), outline=CYAN, width=2)
    draw.text((110, 84), "📑  DIGITAL FORMULA CARDS & ANALYTICS", font=FONT_BODY_BOLD, fill=CYAN)

    draw.text((60, 145), "5-MINUTE REVISION CARDS", font=FONT_TITLE_BOLD, fill=WHITE)
    draw.text((60, 200), "PINPOINT YOUR WEAK CHAPTERS", font=FONT_HEADING, fill=GOLD)

    # Formula Card Container (Top half)
    fc_box = [50, 260, WIDTH - 50, 600]
    draw_rounded_card(draw, fc_box, radius=20, fill=(18, 24, 38), outline=BORDER_COLOR, width=2)
    draw.text((fc_box[0] + 25, fc_box[1] + 18), "Math • Nature of Roots Flowchart", font=FONT_BODY_BOLD, fill=GOLD)
    draw.text((fc_box[2] - 140, fc_box[1] + 18), "⚡ Swipe Next", font=FONT_SMALL, fill=GRAY)

    # Embed real formula card image resized nicely inside the container
    fc_w = fc_box[2] - fc_box[0] - 40
    fc_h = 240
    fc_resized = FORMULA_CARD_IMG.resize((fc_w, fc_h), Image.Resampling.LANCZOS)
    img.alpha_composite(fc_resized, (fc_box[0] + 20, fc_box[1] + 60))

    # Analytics Radar / Weak Chapter Bar Chart Container (Bottom half)
    ana_box = [50, 630, WIDTH - 50, 1020]
    draw_rounded_card(draw, ana_box, radius=20, fill=(16, 22, 36), outline=(50, 70, 110), width=2)
    draw.text((ana_box[0] + 25, ana_box[1] + 20), "AI Weak Chapter Detection (Physics)", font=FONT_BODY_BOLD, fill=WHITE)
    draw.text((ana_box[0] + 25, ana_box[1] + 52), "Identified from your last 5 Mock Tests", font=FONT_SMALL, fill=GRAY)

    # Animated Progress Bars
    chapters = [
        ("Rotational Dynamics", 0.38, RED, "⚠️ High Priority Weakness (-16 Marks)"),
        ("Current Electricity", 0.88, GREEN, "🎯 Mastered (Consistent +20 Marks)"),
        ("Thermodynamics", 0.45, (245, 158, 11), "🟡 Focus Needed (+12 Marks Gain)")
    ]

    for i, (chap, target_pct, col, note) in enumerate(chapters):
        cy = ana_box[1] + 90 + i * 85
        draw.text((ana_box[0] + 25, cy), chap, font=FONT_BODY_BOLD, fill=WHITE)
        
        # Animate bar growing
        bar_p = min(1.0, max(0.0, (f_rel - 15 - i * 15) / 30.0))
        cur_pct = target_pct * bar_p
        
        # Bar track
        draw.rounded_rectangle([ana_box[0] + 25, cy + 32, ana_box[2] - 25, cy + 50], radius=8, fill=(30, 40, 60))
        # Filled Bar
        fill_w = int((ana_box[2] - ana_box[0] - 50) * cur_pct)
        if fill_w > 0:
            draw.rounded_rectangle([ana_box[0] + 25, cy + 32, ana_box[0] + 25 + fill_w, cy + 50], radius=8, fill=col)
        draw.text((ana_box[2] - 90, cy), f"{int(cur_pct * 100)}%", font=FONT_BODY_BOLD, fill=col)
        draw.text((ana_box[0] + 25, cy + 56), note, font=FONT_SMALL, fill=col)

    # Subtitles
    if f_rel < 75:
        draw_subtitles(draw, "डिजिटल फॉर्मूला कार्ड्स से सिर्फ 5 मिनट में रिवीज़न करो!", "5-Minute Quick Revision")
    else:
        draw_subtitles(draw, "डीप एनालिटिक्स से पकड़ो अपने कमज़ोर चैप्टर्स!", "AI Weakness Analytics")

    return img

def render_scene_5(frame_idx):
    # Scene 5: Frames 660 - 795 (22.0s - 26.5s)
    # 1v1 Live Peer Battle Arena: Rank & Gamification
    f_rel = frame_idx - 660
    p = f_rel / 135.0
    img = Image.new("RGBA", (WIDTH, HEIGHT), BG_DARK)
    
    # Ambient Electric Blue vs Neon Pink Glow
    draw_ambient_glow(img, 200, 480, 260, CYAN, alpha=35)
    draw_ambient_glow(img, 520, 480, 260, (236, 72, 153), alpha=35)
    draw = ImageDraw.Draw(img)

    # Top Header
    draw.rounded_rectangle([60, 70, WIDTH - 60, 125], radius=24, fill=(35, 15, 30), outline=(236, 72, 153), width=2)
    draw.text((120, 84), "⚔️  1v1 LIVE PEER BATTLE ARENA", font=FONT_BODY_BOLD, fill=(255, 190, 220))

    draw.text((60, 145), "BORE HO GAYE TOH?", font=FONT_TITLE_BOLD, fill=WHITE)
    draw.text((60, 200), "CHALLENGE FRIENDS LIVE!", font=FONT_HEADING, fill=GOLD)

    # Battle Arena Box
    b_box = [45, 260, WIDTH - 45, 960]
    draw_rounded_card(draw, b_box, radius=24, fill=(17, 24, 39), outline=(90, 50, 120), width=2)

    # Live Timer in center
    draw.rounded_rectangle([WIDTH // 2 - 80, b_box[1] + 20, WIDTH // 2 + 80, b_box[1] + 70], radius=16, fill=(30, 41, 59), outline=GOLD, width=2)
    draw.text((WIDTH // 2 - 55, b_box[1] + 30), "⏱️ 00:04", font=FONT_MONO, fill=GOLD)

    # Left Player: YOU
    p1_box = [65, b_box[1] + 90, WIDTH // 2 - 30, b_box[1] + 360]
    draw.rounded_rectangle(p1_box, radius=18, fill=(15, 35, 55), outline=CYAN, width=2)
    draw.ellipse([p1_box[0] + 50, p1_box[1] + 25, p1_box[0] + 130, p1_box[1] + 105], fill=(30, 60, 95), outline=CYAN, width=2)
    draw.text((p1_box[0] + 75, p1_box[1] + 45), "ME", font=FONT_BODY_BOLD, fill=WHITE)
    draw.text((p1_box[0] + 40, p1_box[1] + 120), "YOU (Aspirant)", font=FONT_BODY_BOLD, fill=WHITE)
    draw.text((p1_box[0] + 50, p1_box[1] + 155), "Score: 450", font=FONT_BODY_BOLD, fill=CYAN)
    draw.text((p1_box[0] + 45, p1_box[1] + 195), "🔥 4x Streak!", font=FONT_SMALL, fill=GOLD)

    # Center VS Badge (Glowing)
    vs_y = b_box[1] + 225
    draw.ellipse([WIDTH // 2 - 40, vs_y - 40, WIDTH // 2 + 40, vs_y + 40], fill=(220, 38, 38), outline=WHITE, width=3)
    draw.text((WIDTH // 2 - 18, vs_y - 14), "VS", font=FONT_BODY_BOLD, fill=WHITE)

    # Right Player: Opponent
    p2_box = [WIDTH // 2 + 30, b_box[1] + 90, WIDTH - 65, b_box[1] + 360]
    draw.rounded_rectangle(p2_box, radius=18, fill=(45, 20, 35), outline=(236, 72, 153), width=2)
    draw.ellipse([p2_box[0] + 50, p2_box[1] + 25, p2_box[0] + 130, p2_box[1] + 105], fill=(80, 30, 50), outline=(236, 72, 153), width=2)
    draw.text((p2_box[0] + 70, p2_box[1] + 45), "AIR", font=FONT_BODY_BOLD, fill=WHITE)
    draw.text((p2_box[0] + 30, p2_box[1] + 120), "Aryan (AIR 99)", font=FONT_BODY_BOLD, fill=WHITE)
    draw.text((p2_box[0] + 45, p2_box[1] + 155), "Score: 380", font=FONT_BODY_BOLD, fill=(236, 72, 153))
    draw.text((p2_box[0] + 45, p2_box[1] + 195), "Streak: 2x", font=FONT_SMALL, fill=GRAY)

    # Speed Question Flash
    q_box = [65, b_box[1] + 390, WIDTH - 65, b_box[1] + 510]
    draw.rounded_rectangle(q_box, radius=18, fill=(24, 32, 52), outline=BORDER_COLOR, width=2)
    draw.text((q_box[0] + 25, q_box[1] + 18), "SPEED QUESTION:", font=FONT_SMALL, fill=GOLD)
    draw.text((q_box[0] + 25, q_box[1] + 48), "\"Unit of Magnetic Permeability (μ₀)?\"", font=FONT_BODY_BOLD, fill=WHITE)
    draw.text((q_box[0] + 25, q_box[1] + 85), "Option: T·m/A  [YOU ANSWERED IN 0.42s!]", font=FONT_BODY_BOLD, fill=GREEN)

    # Victory Pop-up at f_rel >= 60
    if f_rel >= 55:
        vic_box = [65, b_box[1] + 540, WIDTH - 65, b_box[1] + 665]
        draw.rounded_rectangle(vic_box, radius=20, fill=(20, 60, 40), outline=GREEN, width=3)
        draw.text((vic_box[0] + 80, vic_box[1] + 25), "🏆  ROUND VICTORY!", font=FONT_TITLE_BOLD, fill=WHITE)
        draw.text((vic_box[0] + 100, vic_box[1] + 85), "+45 ELO Rating  •  National AIR #42", font=FONT_BODY_BOLD, fill=GOLD)

    # Subtitles
    draw_subtitles(draw, "दोस्तों के साथ 1v1 लाइव बैटल खेलो और रैंक बढ़ाओ!", "1v1 Live Peer Battles")

    return img

def render_scene_6(frame_idx):
    # Scene 6: Frames 795 - 900 (26.5s - 30.0s)
    # High-Converting Grand Outro: PrepZii Logo, Benefits, and Final CTA
    f_rel = frame_idx - 795
    p = f_rel / 105.0
    img = Image.new("RGBA", (WIDTH, HEIGHT), BG_DARK)
    
    # Powerful Golden Sunburst Glow
    draw_ambient_glow(img, WIDTH // 2, 420, 360, GOLD, alpha=45)
    draw = ImageDraw.Draw(img)

    # PrepZii Logo centered with pulsing scale
    pulse = 1.0 + 0.04 * math.sin(f_rel * 0.25)
    logo_w = int(320 * pulse)
    logo_h = int(LOGO_IMG.height * (logo_w / LOGO_IMG.width))
    logo_resized = LOGO_IMG.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    img.alpha_composite(logo_resized, (WIDTH // 2 - logo_w // 2, 160))

    # Bold Headline
    draw.text((105, 360), "CRACK JEE & NEET 2025/26", font=FONT_TITLE_BOLD, fill=WHITE)
    draw.text((150, 420), "WITH 99+ PERCENTILE", font=FONT_HEADING, fill=GOLD)

    # 4 Core Value Pillars (2x2 Grid)
    pillars = [
        ("🎯 10,000+ Real PYQs", "2010 - 2024 NTA Papers"),
        ("⚡ Real NTA CBT UI", "Exact screen layout & timer"),
        ("🤖 24/7 Zi AI Tutor", "Instant Step-by-Step doubts"),
        ("⚔️ 1v1 Live Battles", "Compete & skyrocket rank")
    ]

    for i, (title, sub) in enumerate(pillars):
        row, col = divmod(i, 2)
        px = 60 + col * 310
        py = 500 + row * 110
        draw.rounded_rectangle([px, py, px + 290, py + 95], radius=16, fill=BG_CARD, outline=BORDER_COLOR, width=2)
        draw.text((px + 18, py + 18), title, font=FONT_BODY_BOLD, fill=WHITE)
        draw.text((px + 18, py + 54), sub, font=FONT_SMALL, fill=GRAY)

    # Glowing Action Button
    # Animated shimmer highlight beam across button
    btn_box = [60, 760, WIDTH - 60, 860]
    draw.rounded_rectangle(btn_box, radius=24, fill=(244, 180, 0), outline=(255, 235, 120), width=3)
    draw.text((100, 792), "👉  START FREE AT PREPZII.COM  👈", font=FONT_TITLE_BOLD, fill=(15, 23, 42))

    # Free Badges
    draw.text((140, 890), "✅ 100% Free Practice  •  No Credit Card Needed", font=FONT_BODY_BOLD, fill=GREEN)
    draw.text((185, 930), "Trusted by 25,000+ Aspirants across India", font=FONT_SMALL, fill=GRAY)

    # Subtitles
    draw_subtitles(draw, "अभी जाओ prepzii.com पर, और बिल्कुल फ्री में शुरू करो!", "Visit PrepZii.com Now")

    return img

def render_frame(f):
    # Scene Selector & Smooth Transitions
    if f < 165:
        # Scene 1
        img = render_scene_1(f)
    elif f < 330:
        # Scene 2
        img = render_scene_2(f)
    elif f < 495:
        # Scene 3
        img = render_scene_3(f)
    elif f < 660:
        # Scene 4
        img = render_scene_4(f)
    elif f < 795:
        # Scene 5
        img = render_scene_5(f)
    else:
        # Scene 6
        img = render_scene_6(f)

    # Transition Effects at boundaries:
    # 1. f in [155, 165]: Scene 1 -> 2 whip push zoom
    # 2. f in [320, 330]: Scene 2 -> 3 horizontal flash
    # 3. f in [485, 495]: Scene 3 -> 4 card 3D wipe
    # 4. f in [650, 660]: Scene 4 -> 5 saber cut
    # 5. f in [785, 795]: Scene 5 -> 6 zoom explosion
    
    cv_img = cv2.cvtColor(np.array(img), cv2.COLOR_RGBA2BGR)
    
    # Transition 1: Whip blur
    if 155 <= f <= 165:
        kernel_size = (f - 155) * 4 + 1
        cv_img = cv2.GaussianBlur(cv_img, (kernel_size, 1), 0)
    elif 165 < f <= 175:
        kernel_size = (175 - f) * 4 + 1
        cv_img = cv2.GaussianBlur(cv_img, (kernel_size, 1), 0)
        
    # Transition 2: RGB Glitch cut
    if 323 <= f <= 330:
        shift = (f - 323) * 3
        b, g, r = cv2.split(cv_img)
        M_r = np.float32([[1, 0, shift], [0, 1, 0]])
        M_b = np.float32([[1, 0, -shift], [0, 1, 0]])
        r_shifted = cv2.warpAffine(r, M_r, (WIDTH, HEIGHT))
        b_shifted = cv2.warpAffine(b, M_b, (WIDTH, HEIGHT))
        cv_img = cv2.merge([b_shifted, g, r_shifted])

    # Transition 4: Light flash cut
    if 654 <= f <= 660:
        flash_intensity = int((f - 654) * 35)
        cv_img = cv2.add(cv_img, np.full_like(cv_img, flash_intensity))
    elif 660 < f <= 666:
        flash_intensity = int((666 - f) * 35)
        cv_img = cv2.add(cv_img, np.full_like(cv_img, flash_intensity))

    return cv_img

def main():
    print(f"Starting PrepZii Promo Video Render: {TOTAL_FRAMES} frames @ {FPS} fps ({WIDTH}x{HEIGHT})...")
    raw_video = "prepzii_raw_video.mp4"
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(raw_video, fourcc, float(FPS), (WIDTH, HEIGHT))

    t0 = time.time()
    for f in range(TOTAL_FRAMES):
        frame = render_frame(f)
        out.write(frame)
        if (f + 1) % 100 == 0:
            elapsed = time.time() - t0
            print(f"Rendered {f + 1}/{TOTAL_FRAMES} frames ({elapsed:.1f}s, {(f+1)/elapsed:.1f} fps)")

    out.release()
    total_time = time.time() - t0
    print(f"Video frames rendered in {total_time:.2f} seconds.")

    # Mux with broadcast audio
    final_mp4 = "prepzii_promo_video.mp4"
    audio_file = "prepzii_audio_master.m4a"
    print(f"Muxing {raw_video} with {audio_file} -> {final_mp4} using AVFoundation...")
    
    cmd = ["./muxer", raw_video, audio_file, final_mp4]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"SUCCESS: Generated final video at {final_mp4}")
        if os.path.exists(raw_video):
            os.remove(raw_video)
    else:
        print("Muxer error:", res.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
