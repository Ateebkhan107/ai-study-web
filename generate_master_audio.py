import wave, numpy as np, subprocess

sr = 44100
dur = 30.0
total_samples = int(sr * dur)
t = np.linspace(0, dur, total_samples, endpoint=False)

# 1. Background Music (Modern EdTech / Trap-Chill Beat at 120 BPM)
bpm = 120
beat_len = 60.0 / bpm  # 0.5 sec per beat
bgm = np.zeros(total_samples, dtype=np.float32)

# Chords: Am (A3, C4, E4), F (F3, A3, C4), C (C3, E3, G3), G (G3, B3, D4)
chords = [
    [220.0, 261.63, 329.63], # Am
    [174.61, 220.0, 261.63], # F
    [130.81, 164.81, 196.0], # C
    [196.0, 246.94, 293.66], # G
]

for bar in range(int(dur / 2.0) + 1):
    bar_start_t = bar * 2.0
    chord = chords[bar % len(chords)]
    for note_freq in chord:
        s_idx = int(bar_start_t * sr)
        e_idx = min(total_samples, int((bar_start_t + 1.9) * sr))
        if s_idx >= total_samples: break
        dur_note = (e_idx - s_idx) / sr
        tt = np.linspace(0, dur_note, e_idx - s_idx)
        # Warm Rhodes-like electric piano note (sine + harmonic + envelope)
        env = np.exp(-tt * 2.5) * (1 - np.exp(-tt * 50))
        wave_note = (np.sin(2 * np.pi * note_freq * tt) + 0.3 * np.sin(4 * np.pi * note_freq * tt)) * env
        bgm[s_idx:e_idx] += wave_note * 0.08

# Rhythmic Drums: Kick on beat 1 & 3, Snare/Clap on beat 2 & 4, Hi-hats on 8ths
for beat_idx in range(int(dur / beat_len)):
    beat_t = beat_idx * beat_len
    b_type = beat_idx % 4
    s_idx = int(beat_t * sr)
    
    # Hi-hat on every 8th note
    for sub in [0, beat_len / 2.0]:
        hh_idx = int((beat_t + sub) * sr)
        hh_len = int(sr * 0.04)
        if hh_idx + hh_len < total_samples:
            noise = np.random.uniform(-1, 1, hh_len) * np.exp(-np.linspace(0, 1, hh_len) * 30)
            bgm[hh_idx:hh_idx + hh_len] += noise * 0.035
            
    # Kick on beat 0 and 2.5
    if b_type == 0 or b_type == 2:
        k_len = int(sr * 0.18)
        if s_idx + k_len < total_samples:
            kt = np.linspace(0, 0.18, k_len)
            k_freq = 140 * np.exp(-kt * 28) + 45
            k_wave = np.sin(2 * np.pi * k_freq * kt) * np.exp(-kt * 18)
            bgm[s_idx:s_idx + k_len] += k_wave * 0.18
            
    # Snare on beat 1 and 3
    if b_type == 1 or b_type == 3:
        sn_len = int(sr * 0.22)
        if s_idx + sn_len < total_samples:
            snt = np.linspace(0, 0.22, sn_len)
            sn_tone = np.sin(2 * np.pi * 185 * snt) * np.exp(-snt * 22) * 0.1
            sn_noise = np.random.uniform(-1, 1, sn_len) * np.exp(-snt * 16) * 0.12
            bgm[s_idx:s_idx + sn_len] += (sn_tone + sn_noise)

# 2. Sound Effects (Whooshes, Clicks, Chimes, Impacts)
sfx = np.zeros(total_samples, dtype=np.float32)

def add_whoosh(start_sec, dur_sec=0.6, peak=0.15):
    idx = int(start_sec * sr)
    l = int(dur_sec * sr)
    if idx + l > total_samples: return
    wt = np.linspace(-1, 1, l)
    noise = np.random.uniform(-1, 1, l)
    env = np.exp(-wt**2 * 8)
    sweep = np.sin(2 * np.pi * (200 + 600 * (wt + 1) / 2) * np.linspace(0, dur_sec, l))
    sfx[idx:idx + l] += (noise * 0.7 + sweep * 0.3) * env * peak

def add_click(start_sec):
    idx = int(start_sec * sr)
    l = int(0.04 * sr)
    if idx + l > total_samples: return
    ct = np.linspace(0, 0.04, l)
    sfx[idx:idx + l] += np.sin(2 * np.pi * 1200 * ct) * np.exp(-ct * 80) * 0.25

def add_chime(start_sec):
    idx = int(start_sec * sr)
    l = int(0.8 * sr)
    if idx + l > total_samples: return
    cht = np.linspace(0, 0.8, l)
    notes = [523.25, 659.25, 783.99, 1046.5] # C Major chord chime
    for n in notes:
        sfx[idx:idx + l] += np.sin(2 * np.pi * n * cht) * np.exp(-cht * 6) * 0.06

def add_impact(start_sec):
    idx = int(start_sec * sr)
    l = int(1.2 * sr)
    if idx + l > total_samples: return
    it = np.linspace(0, 1.2, l)
    sub = np.sin(2 * np.pi * (80 * np.exp(-it * 8) + 35) * it) * np.exp(-it * 4) * 0.35
    noise = np.random.uniform(-1, 1, l) * np.exp(-it * 14) * 0.15
    sfx[idx:idx + l] += sub + noise

# Add transitions
transitions = [5.3, 10.8, 16.3, 21.8, 26.3]
for tr in transitions:
    add_whoosh(tr - 0.3, dur_sec=0.5, peak=0.18)

# Add UI interactions
add_click(8.2)     # CBT Option Select
add_chime(12.8)    # Zi AI activation
add_chime(24.2)    # 1v1 Battle victory
add_impact(26.4)   # Outro punch

# 3. Load Voiceover
with wave.open("prepzii_voiceover.wav", "rb") as w:
    n_vo = w.getnframes()
    vo_raw = np.frombuffer(w.readframes(n_vo), dtype=np.int16).astype(np.float32) / 32768.0

vo_track = np.zeros(total_samples, dtype=np.float32)
vo_start = int(sr * 0.2)
vo_len = min(len(vo_raw), total_samples - vo_start)
vo_track[vo_start:vo_start + vo_len] = vo_raw[:vo_len] * 1.15

# 4. Master Mixing & Dynamic Ducking
# Sidechain ducking: when voiceover is loud, reduce BGM by 45%
vo_envelope = np.abs(vo_track)
# Smooth envelope
kernel = np.ones(int(sr * 0.1)) / (sr * 0.1)
vo_smoothed = np.convolve(vo_envelope, kernel, mode='same')
duck_gain = 1.0 - 0.55 * np.clip(vo_smoothed * 4.0, 0.0, 1.0)
bgm_ducked = bgm * duck_gain

final_mix = vo_track + bgm_ducked + sfx
# Soft limiter / normalizer
peak = np.max(np.abs(final_mix))
if peak > 0.95:
    final_mix = (final_mix / peak) * 0.95

# Convert to 16-bit PCM
final_int16 = (final_mix * 32767).astype(np.int16)

master_wav = "prepzii_audio_master.wav"
with wave.open(master_wav, "wb") as out_w:
    out_w.setnchannels(1)
    out_w.setsampwidth(2)
    out_w.setframerate(sr)
    out_w.writeframes(final_int16.tobytes())

print(f"Master audio WAV created: {master_wav}")
subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", master_wav, "prepzii_audio_master.m4a", "-y"], check=True)
print("Master audio M4A created: prepzii_audio_master.m4a")
