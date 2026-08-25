from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from io import BytesIO
from pathlib import Path

import pdfplumber
from PIL import Image


ROOT = Path.cwd()
OUT = ROOT / "tmp" / "jee-main-2024-04apr-clean-repair"
PDFS = {
    "JEE-MAIN-24-04APR-S1": ROOT / "tmp/pdfs/drive-1C3eYdfTXtkUyxjQSIdiW89U5-KIFrEOF.pdf",
    "JEE-MAIN-24-04APR-S2": ROOT / "tmp/pdfs/drive-1szZ2LieKVHhLVyksv3p5ldN_XB0Fo98s.pdf",
    "JEE-MAIN-24-05APR-S1": ROOT / "tmp/pdfs/drive-1EE_vPu11xciFvd1zMgkYYmSg0uJr5Hbe.pdf",
    "JEE-MAIN-24-05APR-S2": ROOT / "tmp/pdfs/drive-1BoG_ezW45gwQgRvD7bJVkAGyNmgush47.pdf",
    "JEE-MAIN-24-06APR-S1": ROOT / "tmp/pdfs/drive-1C6DF8Q8fSAEwddRPGnzPxKm5qfnJQh7A.pdf",
    "JEE-MAIN-24-06APR-S2": ROOT / "tmp/pdfs/drive-1uNp-c1f7LUw3pkSWDK-t6Jc_SkHbBFZv.pdf",
    "JEE-MAIN-24-08APR-S1": ROOT / "tmp/pdfs/drive-1yvy0KodkGAjmCTUbX2E_vJDbrhMuPT-N.pdf",
    "JEE-MAIN-24-08APR-S2": ROOT / "tmp/pdfs/drive-1jZj5bc4e5BVLUXyKsjA4nT2ujO56kd0w.pdf",
    "JEE-MAIN-24-09APR-S1": ROOT / "tmp/pdfs/drive-1cOQmcyUI7vEYsJrGpIv2NqCpSYLx57iI.pdf",
    "JEE-MAIN-24-09APR-S2": ROOT / "tmp/pdfs/drive-143UBsH9eXBBVZQFRRPCO9fc2YN64lP7f.pdf",
}

PROMO_RE = re.compile(
    r"Join the Most Relevant Test Series.*?https://links\.mathongo\.com/mWN",
    re.I | re.S,
)
HEADER_RE = re.compile(
    r"J\s*EE Main 2024 \(0[45689] Apr Shift [12]\) JEE Main Previous Year Paper\s*Question Paper MathonGo",
    re.I,
)

VISUAL_SOURCE_QUESTIONS = {
    "JEE-MAIN-24-04APR-S1": {
        5, 8, 11, 12, 18, 20, 26, 27, 35, 38, 46, 48, 50, 59,
    },
    "JEE-MAIN-24-04APR-S2": {
        2, 4, 14, 19, 20, 27, 37, 40, 41, 48, 49, 58,
    },
    "JEE-MAIN-24-05APR-S1": {
        5, 6, 9, 11, 13, 15, 18, 20, 22, 26, 28, 40, 41, 48, 49, 58, 59,
    },
    "JEE-MAIN-24-05APR-S2": {
        12, 19, 23, 25, 37, 39, 47, 48, 49, 54, 59,
    },
    "JEE-MAIN-24-06APR-S1": {
        12, 13, 19, 25, 38, 39, 40, 42, 47, 48, 50, 52, 59,
    },
    "JEE-MAIN-24-06APR-S2": {
        12, 23, 25, 26, 42, 43, 44, 45, 46, 47, 49, 57, 58, 59, 60,
    },
    "JEE-MAIN-24-08APR-S1": {
        9, 12, 19, 21, 22, 25, 39, 40, 41, 42, 46, 47, 48, 49, 50, 51, 52, 53, 58, 60, 82,
    },
    "JEE-MAIN-24-08APR-S2": {
        5, 7, 15, 22, 25, 26, 30, 37, 48, 49, 54, 55, 82,
    },
    "JEE-MAIN-24-09APR-S1": {
        11, 12, 26, 35, 36, 38, 39, 40, 43, 48, 49, 50, 55, 57,
    },
    "JEE-MAIN-24-09APR-S2": {
        3, 7, 9, 10, 12, 14, 19, 26, 27, 38, 45, 47, 48, 49, 53,
    },
}

MANUAL_OVERRIDES = {
    "JEE-MAIN-24-04APR-S1": {
        8: {
            "options": ["13/3", "16/3", "11/3", "14/3"],
        },
        10: {
            "options": ["11π/24", "5π/24", "7π/24", "3π/4"],
        },
        20: {
            "options": ["5/18", "5/16", "4/17", "7/18"],
        },
        37: {
            "options": ["GmMπ^2/L^2", "GMmπ/(2L^2)", "0", "2GmMπ/L^2"],
        },
    },
    "JEE-MAIN-24-04APR-S2": {
        1: {
            "question": "The area (in sq. units) of the region S = {z ∈ C : |z − 1| ≤ 2; (z + z¯) + i(z − z¯) ≤ 2, Im(z) ≥ 0} is:",
            "options": ["7π/3", "7π/4", "17π/8", "3π/2"],
        },
        2: {
            "question": "The value of (1×2^2 + 2×3^2 + ... + 100×101^2)/(1^2×2 + 2^2×3 + ... + 100^2×101) is:",
            "options": ["32/31", "31/30", "306/305", "305/301"],
        },
        7: {
            "options": ["14/3", "28/3", "11/3", "10/3"],
        },
        9: {
            "question": "If the mean of the following probability distribution of a random variable X is 46/9, then the variance of the distribution is: X: 0, 2, 4, 6, 8; P(X): a, 2a, a + b, 2b, 3b.",
            "options": ["173/27", "566/81", "151/27", "581/81"],
        },
        15: {
            "options": ["π/3", "π/6", "π/4", "π/2"],
        },
        16: {
            "options": ["11/32", "8/9", "11/12", "9/32"],
        },
        41: {
            "options": ["q/(2ε0)", "q/(8ε0)", "Zero", "q/(4ε0)"],
        },
        48: {
            "options": ["h/π", "h/(2π)", "8h/π", "2h/π"],
        },
    },
    "JEE-MAIN-24-05APR-S1": {
        1: {
            "options": [
                "Statement I is correct but Statement II is incorrect.",
                "Both Statement I and Statement II are correct.",
                "Both Statement I and Statement II are incorrect.",
                "Statement I is incorrect but Statement II is correct.",
            ],
        },
        3: {
            "options": ["4/(3√6 + 2)", "(6 + √6)/(3√6 + 2)", "4/(3√6 - 2)", "(6 - √6)/(3√6 - 2)"],
        },
        20: {
            "options": ["1/128", "1/64", "3/256", "3/128"],
        },
        31: {
            "options": ["tan^-1((2Q - 2P)/(2Q + 2P))", "0°", "tan^-1(P/Q)", "tan^-1(2Q/P)"],
        },
        42: {
            "options": ["(√3/2)Z", "(2/√3)Z", "(3/4)Z", "(4/3)Z"],
        },
        45: {
            "options": ["μ0πb^2/(2a)", "μ0b^2/(2πa)", "μ0a^2/(2πb)", "μ0πa^2/(2b)"],
        },
        65: {
            "options": [
                "(A) is true but (R) is false",
                "Both (A) and (R) are true but (R) is not the correct explanation of (A)",
                "Both (A) and (R) are true and (R) is the correct explanation of (A)",
                "(A) is false but (R) is true",
            ],
        },
    },
    "JEE-MAIN-24-05APR-S2": {
        1: {
            "question": "Let S1 = {z ∈ C : |z| ≤ 5}, S2 = {z ∈ C : Im((z + 1 - √3i)/(1 - √3i)) ≥ 0} and S3 = {z ∈ C : Re(z) ≥ 0}. Then the area of the region S1 ∩ S2 ∩ S3 is:",
            "options": ["125π/12", "125π/4", "125π/24", "125π/6"],
        },
        3: {
            "options": ["8", "4", "10", "16"],
        },
        4: {
            "question": "If the constant term in the expansion of (5^(1/3)/x + 2x/3^(1/5))^12, x ≠ 0, is α × 2^8 × 5^(1/3), then 25α is equal to:",
            "options": ["724", "742", "639", "693"],
        },
        5: {
            "options": ["6", "-6/5", "4", "-12/5"],
        },
        13: {
            "options": ["1/2", "1", "2", "3/2"],
        },
        15: {
            "options": ["4/3", "1", "2/3", "8/3"],
        },
        31: {
            "question": "A particle moves in x-y plane under the influence of a force F such that its linear momentum is p(t) = i cos(kt) - j sin(kt). If k is constant, the angle between F and p will be:",
            "options": ["π/4", "π/6", "π/2", "π/3"],
        },
        38: {
            "options": ["5/3", "9/7", "3/2", "7/5"],
        },
        39: {
            "options": ["√2nπd^2", "1/(√2nπd^2)", "1/(√2nπd^2)", "1/(√2n^2π^2d^2)"],
        },
        42: {
            "options": ["1: 2", "2: 1", "4: 1", "1: 1"],
        },
        48: {
            "options": ["r", "√r", "1/√r", "1/r"],
        },
        64: {
            "options": [
                "Both (A) and (R) are true and (R) is the correct explanation of (A)",
                "(A) is false but (R) is true",
                "Both (A) and (R) are true but (R) is NOT the correct explanation of (A)",
                "(A) is true but (R) is false",
            ],
        },
    },
    "JEE-MAIN-24-06APR-S1": {
        34: {
            "options": ["(1 + √5)/(√5 - 1)", "(√2 - 1)/(√2 + 1)", "(1 + √5)/(√2 - 1)", "(√3 + 1)/(√2 - 1)"],
        },
        5: {
            "options": ["2√2/3", "5√2/3", "2√2", "4√2/3"],
        },
        8: {
            "options": ["3 + π/2", "3/4 + π/8", "3/8 + π/4", "5/2 + π/8"],
        },
        17: {
            "options": ["0", "(e^(π/2) - 1)/2", "(1 - e^(π/2))/2", "(e^(π/2) - 1)/4"],
        },
        31: {
            "question": "To find the spring constant (k) of a spring experimentally, a student commits 2% positive error in the measurement of time and 1% negative error in measurement of mass. The percentage error in determining value of k is:",
        },
        39: {
            "options": ["1", "2√2", "1/(2√2)", "1/4"],
        },
        47: {
            "options": ["E only", "B, D only", "C only", "A, C only"],
        },
        61: {
            "options": ["3.5", "3.8", "2.8", "3.0"],
        },
    },
    "JEE-MAIN-24-06APR-S2": {
        1: {
            "question": "If z1, z2 are two distinct complex numbers such that |(1 - z1 z̄2)/(z1 - z2)| = 2, then:",
            "options": [
                "z1 lies on a circle of radius 1/2 and z2 lies on a circle of radius 1.",
                "Both z1 and z2 lie on the same circle.",
                "Either z1 lies on a circle of radius 1/2 or z2 lies on a circle of radius 1.",
                "Either z1 lies on a circle of radius 1 or z2 lies on a circle of radius 1/2.",
            ],
        },
        8: {
            "options": ["2/3", "1/3", "3/4", "1/2"],
        },
        31: {
            "options": [
                "Both statement (I) and statement (II) are correct",
                "Statement (I) is correct but statement (II) is incorrect",
                "Both statement (I) and statement (II) are incorrect",
                "Statement (I) is incorrect but statement (II) is correct",
            ],
        },
        37: {
            "options": ["2S/R", "4R/S", "S/R", "4S/R"],
        },
        39: {
            "options": ["70 KBT", "35 KBT", "7RT", "35RT/2"],
        },
        78: {
            "options": ["Br−", "I−", "Cl−", "CO3^2−"],
        },
        16: {
            "options": ["2", "√17", "1/2", "√17/2"],
        },
        17: {
            "options": ["1/3", "2/3", "2", "1/5"],
        },
        20: {
            "options": ["18/25", "12/25", "6/25", "4/25"],
        },
    },
    "JEE-MAIN-24-08APR-S1": {
        1: {
            "question": "The sum of all the solutions of the equation 8^(2x) − 16·8^x + 48 = 0 is:",
            "options": ["1 + log_8(6)", "1 + log_6(8)", "log_8(6)", "log_8(4)"],
        },
        2: {
            "options": ["2√6/5", "24/5", "(1 + √6)/5", "√6/5"],
        },
        16: {
            "options": ["2/e", "2/e^2", "1/e", "1/e^2"],
        },
        31: {
            "question": "In an expression a × 10^b:",
        },
        39: {
            "options": ["Va/Vd ≠ Vb/Vc", "Va/Vd = Vb/Vc", "Va/Vd = (Vb/Vc)^-1", "Va/Vd = (Vb/Vc)^2"],
        },
        40: {
            "options": ["7/5", "3/5", "5/3", "3/2"],
        },
        41: {
            "options": ["a/b", "√ab", "b/a", "ab"],
        },
        64: {
            "question": "Match List-I with List-II. List-I (Molecule): A. Fe4[Fe(CN)6]3·xH2O; B. [Fe(CN)5NOS]^4−; C. [Fe(SCN)]^2+; D. (NH4)3PO4·12MoO3. List-II: I. Violet; II. Blood Red A; III. Prussian Blue; IV. Yellow. Choose the correct answer from the options given below:",
        },
    },
    "JEE-MAIN-24-08APR-S2": {
        1: {
            "question": "The sum of all possible values of θ ∈ [−π, 2π], for which (1 + i cos θ)/(1 − 2i cos θ) is purely imaginary, is equal to:",
        },
        2: {
            "options": ["tan^-1(4)", "tan^-1(1/4)", "tan^-1(1/2)", "tan^-1(2)"],
        },
        3: {
            "options": ["√(1 - 1/n^2)", "1 - n^2", "1 - 1/n^2", "√(1 - n^2)"],
        },
        4: {
            "options": ["(3/2)ω", "(5/4)ω", "(2/3)ω", "(4/5)ω"],
        },
        19: {
            "options": ["(2N - 1)", "(2N - 1)/(2N)", "2N/(2N - 1)", "(2N - 1)/(20N)"],
        },
        16: {
            "question": "Let y = y(x) be the solution curve of the differential equation sec y dy/dx + 2x sin y = x^3 cos y, y(1) = 0. Then y(√3) is equal to:",
            "options": ["π/3", "π/6", "π/12", "π/4"],
        },
        20: {
            "options": ["1/4", "1/2", "5/12", "1/3"],
        },
        32: {
            "options": ["tan^-1(4)", "tan^-1(1/4)", "tan^-1(1/2)", "tan^-1(2)"],
        },
        31: {
            "question": "If ε0 is the permittivity of free space and E is the electric field, then ε0E^2 has the dimensions:",
            "options": ["[M^-1 L^-3 T^4 A^2]", "[M L^2 T^-2]", "[M^0 L^-2 T A]", "[M L^-1 T^-2]"],
        },
        37: {
            "options": [
                "2-Ethyl-3,6-dimethylheptane",
                "2,5,6-Trimethyloctane",
                "3,4,7-Trimethyloctane",
                "2-Ethyl-2,6-diethylheptane",
            ],
        },
        64: {
            "question": "The equilibrium Cr2O7^2− ⇌ 2CrO4^2− is shifted to the right in:",
        },
        78: {
            "question": "Match List-I with List-II. List-I (Test): (A) Baeyer's test; (B) Ceric ammonium nitrate test; (C) Phthalein dye test; (D) Schiff's test. List-II (Identification): (I) Phenol; (II) Aldehyde; (III) Alcoholic-OH group; (IV) Unsaturation. Choose the correct answer from the options given below:",
            "options": [
                "(A)-(IV), (B)-(III), (C)-(I), (D)-(II)",
                "(A)-(II), (B)-(III), (C)-(IV), (D)-(I)",
                "(A)-(IV), (B)-(I), (C)-(II), (D)-(III)",
                "(A)-(III), (B)-(I), (C)-(IV), (D)-(II)",
            ],
        },
    },
    "JEE-MAIN-24-09APR-S1": {
        1: {
            "question": "Let α, β be the roots of the equation x^2 + 2√2x − 1 = 0. The quadratic equation, whose roots are α^4 + β^4 and (1/10)(α^6 + β^6), is:",
            "options": ["x^2 − 190x + 9466 = 0", "x^2 − 180x + 9506 = 0", "x^2 − 195x + 9506 = 0", "x^2 − 195x + 9466 = 0"],
        },
        14: {
            "options": [
                "1/3 + 5 sin^-1(2/√5)",
                "1/3 + √5 sin^-1(2/√5)",
                "2/3 + 5 sin^-1(2/√5)",
                "2/3 + √5 sin^-1(2/√5)",
            ],
        },
        20: {
            "options": ["178/√563", "187/√563", "185/√563", "179/√563"],
        },
        31: {
            "options": ["[M L^2 T^-2]", "[M^0 L^2 T^-2]", "[M L T^-2]", "[M^0 L T^-2]"],
        },
        34: {
            "options": ["m/(2α^2d)", "md/(2α^2)", "2mα^2d", "mα^2d/2"],
        },
        35: {
            "options": ["W cos θ", "W/2", "W", "W sin θ"],
        },
        39: {
            "options": ["16/25", "4/5", "8/(5√5)", "2/√5"],
        },
        42: {
            "question": "A galvanometer has a coil of resistance 200Ω with a full scale deflection at 20μA. The value of resistance to be added to use it as an ammeter of range (0 − 20)mA is:",
        },
        50: {
            "options": ["n/(n+1)", "1/(n+1)", "m/(n+1)", "m/(n(n+1))"],
        },
        56: {
            "question": "The current flowing through the 1Ω resistor is n/10 A. The value of n is _________",
        },
        64: {
            "question": "Identify the incorrect statements regarding primary standard of titrimetric analysis. (A) It should be purely available in dry form. (B) It should not undergo chemical change in air. (C) It should be hygroscopic and should react with another chemical instantaneously and stoichiometrically. (D) It should be readily soluble in water. (E) KMnO4 and NaOH can be used as primary standards. Choose the correct answer from the options given below:",
        },
    },
    "JEE-MAIN-24-09APR-S2": {
        1: {
            "question": "Let α, β; α > β, be the roots of the equation x^2 − √2x − √3 = 0. Let P_n = α^n − β^n, n ∈ N. Then (11√3 − 10√2)P_10 + (11√2 + 10)P_11 − 11P_12 is equal to:",
            "options": ["10√3P_9", "11√3P_9", "10√2P_9", "11√2P_9"],
        },
        7: {
            "question": "lim as x → π/2 of [∫ from x^3 to (π/2)^3 (sin(2t^(1/3)) + cos(t^(1/3))) dt] / (x − π/2)^2 is equal to:",
            "options": ["5π^2/9", "9π^2/8", "11π^2/10", "3π^2/2"],
        },
        31: {
            "question": "The de-Broglie wavelength associated with a particle of mass m and energy E is h/√(2mE). The dimensional formula for Planck's constant is:",
            "options": ["[M L^2 T^-1]", "[M L^-1 T^-2]", "[M L T^-2]", "[M^2 L^2 T^-2]"],
        },
        56: {
            "question": "An electric field E⃗ = (2x î) N C^-1 exists in space. A cube of side 2 m is placed in the space as per figure given below. The electric flux through the cube is ______ Nm^2/C.",
        },
        64: {
            "question": "Match List-I with List-II. List-I: A. Melting Point [K]; B. Ionic Radius [M^3+/pm]; C. ΔiH1 [kJ mol^-1]; D. Atomic Radius [pm]. List-II: I. Tl > In > Ga > Al > B; II. B > Tl > Al ≈ Ga > In; III. Tl > In > Al > Ga > B; IV. B > Al > Tl > In > Ga. Choose the correct answer from the options given below:",
        },
        79: {
            "options": ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
        },
        90: {
            "question": "Consider the following test for a group-IV cation. M^2+ + H2S → A (black precipitate) + by product. A + aqua regia → B + NOCl + S + H2O. B + KNO2 + CH3COOH → C + by product. The spin-only magnetic moment value of the metal complex C is ______ BM (nearest integer).",
        },
    },
}


def app_number(source_number: int) -> int:
    if source_number <= 30:
        return source_number + 30
    if source_number <= 60:
        return source_number + 30
    return source_number - 60


def source_number(app_num: int) -> int:
    if app_num <= 30:
        return app_num + 60
    if app_num <= 60:
        return app_num - 30
    return app_num - 30


def subject(app_num: int) -> str:
    if app_num <= 30:
        return "Maths"
    if app_num <= 60:
        return "Physics"
    return "Chemistry"


def question_type(app_num: int) -> str:
    within_subject = ((app_num - 1) % 30) + 1
    return "MCQ" if within_subject <= 20 else "NUMERICAL"


def clean(value: str) -> str:
    value = PROMO_RE.sub(" ", value)
    value = HEADER_RE.sub(" ", value)
    value = value.replace("\u00a0", " ")
    value = re.sub(r"([A-Za-z])\s+([0-9])(?=\s*[,+)=])", r"\1\2", value)
    value = re.sub(r"([A-Za-z])\s+([+-])", r"\1\2", value)
    value = re.sub(r"\s+([,.;:])", r"\1", value)
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def flat(value: str) -> str:
    return re.sub(r"\s+", " ", clean(value)).strip()


def split_prompt_options(chunk: str, src_num: int) -> tuple[str, list[str]]:
    chunk = re.sub(rf"^Q\s*\.?\s*{src_num}\.", "", chunk).strip()
    chunk = clean(chunk)
    prompt_part = re.split(r"\(\s*1\s*\)", chunk, maxsplit=1)[0]
    prompt = flat(prompt_part)
    options = []
    matches = list(re.finditer(r"\(\s*([1-4])\s*\)", chunk))
    if len(matches) >= 4:
        for idx, marker in enumerate(matches[:4]):
            start = marker.end()
            end = matches[idx + 1].start() if idx + 1 < 4 else len(chunk)
            options.append(flat(chunk[start:end]))
    return prompt, options


def extract_text(pdf_path: Path, paper_code: str) -> tuple[dict[int, str], dict[int, str]]:
    with pdfplumber.open(pdf_path) as doc:
        text = "\n".join(page.extract_text(x_tolerance=1, y_tolerance=3) or "" for page in doc.pages)
    text = re.sub(r"(?m)^[−-](Q\d{1,2}\.)", r"\1", text)
    text = re.sub(r"(?<!\n)[−-](Q\d{1,2}\.)", r"\n\1", text)
    body = text[text.find("Q1.") :]
    marks = list(re.finditer(r"(?m)^Q\s*\.?\s*(\d{1,2})\.", body))
    chunks: dict[int, str] = {}
    for idx, mark in enumerate(marks):
        end = marks[idx + 1].start() if idx + 1 < len(marks) else len(body)
        chunks[int(mark.group(1))] = body[mark.start() : end].strip()
    keys_text = body[body.find("ANSWER KEYS") :]
    keys = {int(n): value.strip() for n, value in re.findall(r"\b(\d{1,2})\.\s*\(([^)]+)\)", keys_text)}
    missing_chunks = sorted(set(range(1, 91)) - set(chunks))
    missing_keys = sorted(set(range(1, 91)) - set(keys))
    if missing_chunks or missing_keys:
        raise RuntimeError(f"{paper_code}: missing chunks={missing_chunks}, keys={missing_keys}")
    return chunks, keys


def decode_image(item: dict) -> Image.Image:
    width, height = item["srcsize"]
    data = item["stream"].get_data()
    pixels = width * height
    if len(data) == pixels:
        return Image.frombytes("L", (width, height), data).convert("RGB")
    if len(data) == pixels * 3:
        return Image.frombytes("RGB", (width, height), data).convert("RGB")
    if len(data) == pixels * 4:
        return Image.frombytes("CMYK", (width, height), data).convert("RGB")
    return Image.open(BytesIO(data)).convert("RGB")


def combine(images: list[Image.Image]) -> Image.Image:
    margin = 18
    gap = 14
    width = max(image.width for image in images) + margin * 2
    height = sum(image.height for image in images) + gap * (len(images) - 1) + margin * 2
    out = Image.new("RGB", (width, height), "white")
    y = margin
    for image in images:
        out.paste(image, ((width - image.width) // 2, y))
        y += image.height + gap
    return out


def manual_visual_source(paper_code: str, page_number: int, top: float) -> int | None:
    if paper_code == "JEE-MAIN-24-04APR-S1":
        if page_number == 3 and top < 340:
            return 12
        if page_number == 6 and 340 < top < 680:
            return 35
        if page_number == 7 and 190 < top < 300:
            return 38
        if page_number == 9 and top < 200:
            return 48
    if paper_code == "JEE-MAIN-24-04APR-S2":
        if page_number == 2 and top < 340:
            return 6
        if page_number == 3 and top < 320:
            return 14
        if page_number == 4 and top < 170:
            return 19
        if page_number == 6 and 280 < top < 380:
            return 37
        if page_number == 7 and top < 230:
            return 40
        if page_number == 7 and top < 360:
            return 41
    if paper_code == "JEE-MAIN-24-05APR-S1":
        if page_number == 4 and top < 180:
            return 18
        if page_number == 5 and top < 290:
            return 22
        if page_number == 9 and top < 330:
            return 48
    if paper_code == "JEE-MAIN-24-05APR-S2":
        if page_number == 4 and 100 < top < 260:
            return 23
        if page_number == 7 and top < 330:
            return 39
        if page_number == 8 and top > 400 and top < 510:
            return 48
    if paper_code == "JEE-MAIN-24-06APR-S1":
        if page_number == 3 and top < 260:
            return 13
        if page_number == 5 and top < 280:
            return 25
        if page_number == 9 and top < 300:
            return 48
    if paper_code == "JEE-MAIN-24-06APR-S2":
        if page_number == 3 and top < 110:
            return 12
        if page_number == 5 and top < 220:
            return 23
        if page_number == 8 and top < 160:
            return 43
        if page_number == 8 and top < 275:
            return 44
        if page_number == 9 and top < 290:
            return 46
    if paper_code == "JEE-MAIN-24-08APR-S1":
        if page_number == 5 and top < 230:
            return 25
        if page_number == 7 and top < 330:
            return 40
        if page_number == 9 and top < 220:
            return 48
        if page_number == 10 and top < 230:
            return 51
    if paper_code == "JEE-MAIN-24-08APR-S2":
        if page_number == 1 and 360 < top < 520:
            return 5
        if page_number == 2 and top < 180:
            return 7
        if page_number == 6 and top < 210:
            return 37
        if page_number == 8 and top < 390:
            return 49
    if paper_code == "JEE-MAIN-24-09APR-S1":
        if page_number == 9 and top < 220:
            return 50
        if page_number == 10 and top < 190:
            return 57
    if paper_code == "JEE-MAIN-24-09APR-S2":
        if page_number == 2 and top < 210:
            return 7
        if page_number == 3 and top < 190:
            return 12
        if page_number == 7 and top > 590:
            return 45
        if page_number == 8 and top < 260:
            return 45
        if page_number == 9 and top < 315:
            return 49
    return None


def extract_required_images(pdf_path: Path, paper_code: str) -> dict[int, str]:
    visual_sources = VISUAL_SOURCE_QUESTIONS[paper_code]
    output_dir = OUT / paper_code / "required-images"
    output_dir.mkdir(parents=True, exist_ok=True)
    for old_crop in output_dir.glob("q*.png"):
        old_crop.unlink()
    grouped: dict[int, list[Image.Image]] = defaultdict(list)
    with pdfplumber.open(pdf_path) as doc:
        for page_number, page in enumerate(doc.pages, 1):
            anchors = []
            for word in page.extract_words(x_tolerance=1, y_tolerance=3):
                match = re.search(r"Q\s*\.?\s*(\d{1,2})\.", word["text"])
                if match:
                    anchors.append((int(match.group(1)), float(word["top"])))
            anchors.sort(key=lambda item: item[1])
            for item in sorted(page.images, key=lambda image: (image["top"], image["x0"])):
                if float(item["width"]) < 20 or float(item["height"]) < 20:
                    continue
                src = manual_visual_source(paper_code, page_number, float(item["top"]))
                if src is None:
                    preceding = [anchor for anchor in anchors if anchor[1] <= float(item["top"]) + 3]
                    src = preceding[-1][0] if preceding else None
                if src not in visual_sources:
                    continue
                grouped[src].append(decode_image(item))

    app_paths: dict[int, str] = {}
    for src, images in sorted(grouped.items()):
        if not images:
            continue
        app_num = app_number(src)
        path = output_dir / f"q{app_num:02}.png"
        combine(images).save(path, optimize=True)
        app_paths[app_num] = str(path)
    if paper_code == "JEE-MAIN-24-06APR-S2" and 89 in app_paths:
        app_paths[90] = app_paths[89]
    return app_paths


def prepare(paper_code: str) -> dict:
    pdf_path = PDFS[paper_code]
    chunks, keys = extract_text(pdf_path, paper_code)
    image_paths = extract_required_images(pdf_path, paper_code)
    questions = []
    for app_num in range(1, 91):
        src_num = source_number(app_num)
        qtype = question_type(app_num)
        prompt, options = split_prompt_options(chunks[src_num], src_num)
        has_image = app_num in image_paths
        override = MANUAL_OVERRIDES.get(paper_code, {}).get(app_num, {})
        if "question" in override:
            prompt = override["question"]
        if "options" in override:
            options = override["options"]
        if qtype == "MCQ" and has_image and (len(options) != 4 or any(not option for option in options)):
            options = [f"See figure option {idx}" for idx in range(1, 5)]
        if qtype == "MCQ" and len(options) != 4:
            if has_image:
                options = [f"See figure option {idx}" for idx in range(1, 5)]
            else:
                raise RuntimeError(f"{paper_code}: option parse failed for app Q{app_num}/source Q{src_num}")
        if not prompt:
            prompt = "Refer to the given figure."
        questions.append(
            {
                "number": app_num,
                "source_number": src_num,
                "subject": subject(app_num),
                "question_type": qtype,
                "question": f"Question {app_num}: {prompt}",
                "option_a": "" if qtype == "NUMERICAL" else options[0],
                "option_b": "" if qtype == "NUMERICAL" else options[1],
                "option_c": "" if qtype == "NUMERICAL" else options[2],
                "option_d": "" if qtype == "NUMERICAL" else options[3],
                "answer": keys[src_num],
                "question_image": image_paths.get(app_num),
            }
        )
    return {"paper_code": paper_code, "questions": questions}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    selected = sys.argv[1:] or list(PDFS)
    report = []
    for paper_code in selected:
        payload = prepare(paper_code)
        path = OUT / paper_code / "structured-dataset.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(payload, indent=2, ensure_ascii=False))
        image_rows = [row["number"] for row in payload["questions"] if row.get("question_image")]
        report.append({"paper_code": paper_code, "questions": len(payload["questions"]), "image_rows": image_rows})
    (OUT / "prepare-report.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
