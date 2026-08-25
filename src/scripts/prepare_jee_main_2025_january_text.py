"""Locally build text-first datasets for the nine JEE Main January 2025 papers."""
from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from io import BytesIO
from pathlib import Path

import pdfplumber
from PIL import Image, ImageChops


ROOT = Path.cwd()
OUT = ROOT / "tmp" / "jee-main-2025-january-clean"
PAPERS = {
    "JEE-MAIN-25-22JAN-S2": ROOT / "tmp/pdfs/drive-1EXDGNiAFCoXHaXBGHVBuN6gJzkVtikNf.pdf",
    "JEE-MAIN-25-23JAN-S1": ROOT / "tmp/pdfs/drive-1xGOOQ_kJcP8I4YG66KfHLukk_IxAxkiV.pdf",
    "JEE-MAIN-25-23JAN-S2": ROOT / "tmp/pdfs/drive-1tSi3OfcZww8FEELqTc_EYCMWOthfbr2W.pdf",
    "JEE-MAIN-25-24JAN-S1": ROOT / "tmp/pdfs/drive-1okvc2t19W7ipZE7A8nJ91OXX2SYVrUZt.pdf",
    "JEE-MAIN-25-24JAN-S2": ROOT / "tmp/pdfs/drive-18gxZudFav1LI_UhCy1OvsSI5A3QXGLrm.pdf",
    "JEE-MAIN-25-28JAN-S1": ROOT / "tmp/pdfs/drive-15mHlzoyUCKL5EyE9Ke0vxii_hElQL8_C.pdf",
    "JEE-MAIN-25-28JAN-S2": ROOT / "tmp/pdfs/drive-1idwF32inN0phCply57hEE_5wgUf9M6z3.pdf",
    "JEE-MAIN-25-29JAN-S1": ROOT / "tmp/pdfs/drive-1nTwUJ_7zqvWc3II-WZgtCFjbw111vmLt.pdf",
    "JEE-MAIN-25-29JAN-S2": ROOT / "tmp/pdfs/drive-1TFS_mEVMFxwV9n5GGr7mQhLbhlFoHHIS.pdf",
}

MANUAL_IMAGE_CLIPS = {
    # page number (1-based), PDF-space crop box (left, top, right, bottom)
    ("JEE-MAIN-25-22JAN-S2", 50): (9, (195, 105, 390, 315)),
    ("JEE-MAIN-25-23JAN-S1", 26): (4, (300, 100, 555, 250)),
    ("JEE-MAIN-25-23JAN-S1", 30): (5, (55, 98, 215, 272)),
}

# Graphical/structural options that continue onto the page after the prompt.
# Values are page number (1-based) and PDF-space crop boxes.
MANUAL_OPTION_CLIPS = {
    ("JEE-MAIN-25-23JAN-S2", 51): {
        "option_a": (8, (55, 70, 285, 176)),
        "option_b": (8, (295, 70, 555, 176)),
        "option_c": (8, (55, 176, 285, 286)),
        "option_d": (8, (295, 176, 555, 286)),
    },
    ("JEE-MAIN-25-24JAN-S2", 58): {
        "option_a": (11, (55, 70, 285, 188)),
        "option_b": (11, (295, 70, 555, 188)),
        "option_c": (11, (55, 188, 285, 322)),
        "option_d": (11, (295, 188, 555, 322)),
    },
}

MANUAL_OVERRIDES = {
    ("JEE-MAIN-25-23JAN-S2", 1): {
        "chapter": "Three Dimensional Geometry",
        "question": "The distance of the line $\\dfrac{x-2}{2}=\\dfrac{y-6}{3}=\\dfrac{z-3}{4}$ from the point $(1,4,0)$, measured along the line $\\dfrac{x}{1}=\\dfrac{y-2}{2}=\\dfrac{z+3}{3}$, is:",
        "option_a": "$\\sqrt{17}$", "option_b": "$\\sqrt{15}$", "option_c": "$\\sqrt{14}$", "option_d": "$\\sqrt{13}$",
    },
    ("JEE-MAIN-25-23JAN-S2", 4): {
        "chapter": "Indefinite Integration",
        "question": "Let $\\displaystyle\\int x^3\\sin x\\,dx=g(x)+C$, where $C$ is the constant of integration. If $8\\left(g\\left(\\dfrac{\\pi}{2}\\right)+g'\\left(\\dfrac{\\pi}{2}\\right)\\right)=\\alpha\\pi^3+\\beta\\pi^2+\\gamma$, where $\\alpha,\\beta,\\gamma\\in\\mathbb Z$, then $\\alpha+\\beta-\\gamma$ equals:",
        "option_a": "48", "option_b": "55", "option_c": "62", "option_d": "47",
    },
    ("JEE-MAIN-25-29JAN-S2", 3): {
        "chapter": "Differential Equations",
        "question": "If, for the solution curve $y=f(x)$ of the differential equation $\\dfrac{dy}{dx}+(\\tan x)y=\\dfrac{2+\\sec x}{(1+2\\sec x)^2}$, $x\\in\\left(-\\dfrac{\\pi}{2},\\dfrac{\\pi}{2}\\right)$, $f\\left(\\dfrac{\\pi}{3}\\right)=\\dfrac{\\sqrt3}{10}$, then $f\\left(\\dfrac{\\pi}{4}\\right)$ is equal to:",
        "option_a": "$\\dfrac{\\sqrt3+1}{10(4+\\sqrt3)}$",
        "option_b": "$\\dfrac{5-\\sqrt3}{2\\sqrt2}$",
        "option_c": "$\\dfrac{9\\sqrt3+3}{10(4+\\sqrt3)}$",
        "option_d": "$\\dfrac{4-\\sqrt2}{14}$",
    },
    ("JEE-MAIN-25-29JAN-S2", 5): {
        "chapter": "Matrices",
        "question": "Let $A=[a_{ij}]$ be a matrix of order $3\\times3$, with $a_{ij}=(\\sqrt2)^{i+j}$. If the sum of all the elements in the third row of $A^2$ is $\\alpha+\\beta\\sqrt2$, where $\\alpha,\\beta\\in\\mathbb Z$, then $\\alpha+\\beta$ is equal to:",
    },
    ("JEE-MAIN-25-29JAN-S2", 6): {
        "chapter": "Straight Lines",
        "question": "Let the line $x+y=1$ meet the $x$- and $y$-axes at $A$ and $B$, respectively. A right-angled triangle $AMN$ is inscribed in triangle $OAB$, where $O$ is the origin and $M$ and $N$ lie on $OB$ and $AB$, respectively. If the area of triangle $AMN$ is $\\dfrac49$ of the area of triangle $OAB$ and $AN:NB=\\lambda:1$, then the sum of all possible values of $\\lambda$ is:",
        "option_a": "2", "option_b": "$\\dfrac52$", "option_c": "$\\dfrac12$", "option_d": "$\\dfrac{13}{6}$",
    },
    ("JEE-MAIN-25-29JAN-S2", 19): {
        "chapter": "Relations and Functions",
        "question": "Let $S=\\mathbb N\\cup\\{0\\}$. Define a relation $R$ from $S$ to $\\mathbb R$ by $R=\\{(x,y):\\log_e y=x\\log_e(2/5),\\ x\\in S,\\ y\\in\\mathbb R\\}$. Then the sum of all the elements in the range of $R$ is equal to:",
        "option_a": "$\\dfrac{10}{9}$", "option_b": "$\\dfrac32$", "option_c": "$\\dfrac52$", "option_d": "$\\dfrac53$",
    },
    ("JEE-MAIN-25-29JAN-S2", 42): {
        "chapter": "Thermodynamics",
        "question": "A polyatomic molecule, with $C_V=3R$ and $C_P=4R$ where $R$ is the gas constant, goes from phase-space point $A(P_A=10^5\\,\\mathrm{Pa},\\ V_A=4\\times10^{-6}\\,\\mathrm{m^3})$ to point $B(P_B=5\\times10^4\\,\\mathrm{Pa},\\ V_B=6\\times10^{-6}\\,\\mathrm{m^3})$, and then to point $C(P_C=10^4\\,\\mathrm{Pa},\\ V_C=8\\times10^{-6}\\,\\mathrm{m^3})$. $A$ to $B$ is an adiabatic path and $B$ to $C$ is an isothermal path. The net heat absorbed per mole by the system is:",
        "option_a": "$500R(\\ln3+\\ln4)$", "option_b": "$450R(\\ln4-\\ln3)$",
        "option_c": "$500R\\ln2$", "option_d": "$400R\\ln4$",
    },
    ("JEE-MAIN-25-29JAN-S2", 70): {
        "chapter": "Thermodynamics",
        "question": "At constant temperature, the following thermochemical equations are given:\n\n$\\mathrm{C(diamond)\\rightarrow C(graphite)}+X\\,\\mathrm{kJ\\,mol^{-1}}$\n\n$\\mathrm{C(diamond)+O_2(g)\\rightarrow CO_2(g)}+Y\\,\\mathrm{kJ\\,mol^{-1}}$\n\n$\\mathrm{C(graphite)+O_2(g)\\rightarrow CO_2(g)}+Z\\,\\mathrm{kJ\\,mol^{-1}}$\n\nThen:",
        "option_a": "$X=-Y+Z$", "option_b": "$-X=Y+Z$",
        "option_c": "$X=Y+Z$", "option_d": "$X=Y-Z$",
    },
    ("JEE-MAIN-25-29JAN-S2", 1): {
        "chapter": "Definite Integrals",
        "question": "Let $f(x)=\\displaystyle\\int_0^x t(t^2-9t+20)\\,dt$, for $1\\le x\\le5$. If the range of $f$ is $[\\alpha,\\beta]$, then $4(\\alpha+\\beta)$ equals:",
        "option_a": "253", "option_b": "154", "option_c": "125", "option_d": "157",
    },
    ("JEE-MAIN-25-29JAN-S2", 2): {
        "chapter": "Vector Algebra",
        "question": "Let $\\hat a$ be a unit vector perpendicular to $\\vec b=\\hat i-2\\hat j+3\\hat k$ and $\\vec c=2\\hat i+3\\hat j-\\hat k$, and making an angle $\\cos^{-1}(-1/3)$ with $\\hat i+\\hat j+\\hat k$. If $\\hat a$ makes an angle $\\pi/3$ with $\\hat i+\\alpha\\hat j+\\hat k$, then the value of $\\alpha$ is:",
        "option_a": "$\\sqrt6$", "option_b": "$-\\sqrt6$", "option_c": "$-\\sqrt3$", "option_d": "$\\sqrt3$",
    },
    ("JEE-MAIN-25-29JAN-S2", 4): {
        "chapter": "Three Dimensional Geometry",
        "question": "Let $P$ be the foot of the perpendicular from $(1,2,2)$ to the line $L:\\dfrac{x-1}{1}=\\dfrac{y+1}{1}=\\dfrac{z-2}{2}$. Let $\\vec r=(-\\hat i+\\hat j-2\\hat k)+\\lambda(\\hat i-\\hat j+\\hat k)$, $\\lambda\\in\\mathbb R$, intersect $L$ at $Q$. Then $2(PQ)^2$ is equal to:",
        "option_a": "25", "option_b": "19", "option_c": "29", "option_d": "27",
    },
    ("JEE-MAIN-25-22JAN-S2", 60): {
        "question": "Match List-I with List-II.\n\n| List-I: Partial derivative | List-II: Thermodynamic quantity |\n|---|---|\n| (A) $\\left(\\frac{\\partial G}{\\partial T}\\right)_P$ | (I) $C_P$ |\n| (B) $\\left(\\frac{\\partial H}{\\partial T}\\right)_P$ | (II) $-S$ |\n| (C) $\\left(\\frac{\\partial G}{\\partial P}\\right)_T$ | (III) $C_V$ |\n| (D) $\\left(\\frac{\\partial U}{\\partial T}\\right)_V$ | (IV) $V$ |\n\nChoose the correct answer:",
        "needs_image": False, "question_image": None,
    },
    ("JEE-MAIN-25-22JAN-S2", 68): {
        "question": "Match each compound in List-I with the appropriate catalyst/reagent in List-II for reduction to the corresponding amine.\n\n| List-I: Compound | List-II: Catalyst/Reagent |\n|---|---|\n| (A) $\\mathrm{RCONH_2}$ | (I) Aqueous $\\mathrm{NaOH}$ |\n| (B) Nitrobenzene | (II) $\\mathrm{H_2/Ni}$ |\n| (C) $\\mathrm{RCN}$ | (III) $\\mathrm{LiAlH_4, H_2O}$ |\n| (D) N-substituted phthalimide | (IV) $\\mathrm{Sn/HCl}$ |\n\nChoose the correct answer:",
        "needs_image": False, "question_image": None,
    },
    ("JEE-MAIN-25-23JAN-S1", 36): {
        "question": "Match List-I with List-II.\n\n| List-I | List-II |\n|---|---|\n| (A) Pressure varies inversely with volume of an ideal gas. | (I) Adiabatic process |\n| (B) Heat absorbed partly increases internal energy and partly does work. | (II) Isochoric process |\n| (C) Heat is neither absorbed nor released by a system. | (III) Isothermal process |\n| (D) No work is done on or by a gas. | (IV) Isobaric process |\n\nChoose the correct answer:",
    },
    ("JEE-MAIN-25-23JAN-S1", 55): {
        "question": "Match List-I with List-II.\n\n| List-I: Classification based on octet rule | List-II: Example |\n|---|---|\n| (A) Molecules obeying the octet rule | (I) $\\mathrm{NO, NO_2}$ |\n| (B) Molecules with an incomplete octet | (II) $\\mathrm{BCl_3, AlCl_3}$ |\n| (C) Molecules with an incomplete octet and an odd electron | (III) $\\mathrm{H_2SO_4, PCl_5}$ |\n| (D) Molecules with an expanded octet | (IV) $\\mathrm{CCl_4, CO_2}$ |\n\nChoose the correct answer:",
        "needs_image": False, "question_image": None,
    },
    ("JEE-MAIN-25-23JAN-S1", 67): {
        "question": "Match List-I with List-II.\n\n| List-I: Named reaction | List-II: Product obtainable |\n|---|---|\n| (A) Swarts reaction | (I) Ethylbenzene |\n| (B) Sandmeyer reaction | (II) Ethyl iodide |\n| (C) Wurtz-Fittig reaction | (III) Cyanobenzene |\n| (D) Finkelstein reaction | (IV) Ethyl fluoride |\n\nChoose the correct answer:",
        "needs_image": False, "question_image": None,
    },
    ("JEE-MAIN-25-23JAN-S1", 72): {
        "question": "For the thermal decomposition $2\\mathrm{N_2O_5(g)}\\rightarrow2\\mathrm{N_2O_4(g)}+\\mathrm{O_2(g)}$ at constant volume, the following data are given:\n\n| Time (s) | Total pressure (atm) |\n|---:|---:|\n| 0 | 0.6 |\n| 100 | $x$ |\n\nIf the rate constant is $4.606\\times10^{-2}\\,\\mathrm{s^{-1}}$, then $x=\\_\\_\\_\\times10^{-3}\\,\\mathrm{atm}$ (nearest integer).",
        "needs_image": False, "question_image": None,
    },
    ("JEE-MAIN-25-23JAN-S2", 44): {
        "question": "Match List-I with List-II.\n\n| List-I | List-II: Dimensions |\n|---|---|\n| (A) Permeability of free space | (I) $[ML^2T^{-2}]$ |\n| (B) Magnetic field | (II) $[MT^{-2}A^{-1}]$ |\n| (C) Magnetic moment | (III) $[MLT^{-2}A^{-2}]$ |\n| (D) Torsional constant | (IV) $[L^2A]$ |\n\nChoose the correct answer:",
    },
    ("JEE-MAIN-25-23JAN-S2", 66): {
        "question": "Match List-I with List-II.\n\n| List-I: Alloy | List-II: Constituents |\n|---|---|\n| (A) Bronze | (I) Cu, Ni |\n| (B) Brass | (II) Fe, Cr, Ni, C |\n| (C) UK silver coin | (III) Cu, Zn |\n| (D) Stainless steel | (IV) Cu, Sn |\n\nChoose the correct answer:",
    },
    ("JEE-MAIN-25-24JAN-S2", 52): {
        "question": "Match List-I with List-II.\n\n| List-I: Transition-metal ion | List-II: Spin-only magnetic moment (B.M.) |\n|---|---|\n| (A) $\\mathrm{Ti^{3+}}$ | (I) 3.87 |\n| (B) $\\mathrm{V^{2+}}$ | (II) 0.00 |\n| (C) $\\mathrm{Ni^{2+}}$ | (III) 1.73 |\n| (D) $\\mathrm{Sc^{3+}}$ | (IV) 2.84 |\n\nChoose the correct answer:",
        "needs_image": False, "question_image": None,
    },
    ("JEE-MAIN-25-28JAN-S1", 62): {
        "question": "Match List-I with List-II.\n\n| List-I: Redox reaction | List-II: Type |\n|---|---|\n| (A) $\\mathrm{CH_4+2O_2\\rightarrow CO_2+2H_2O}$ | (I) Disproportionation |\n| (B) $\\mathrm{2NaH\\xrightarrow{\\Delta}2Na+H_2}$ | (II) Combination |\n| (C) $\\mathrm{V_2O_5+5Ca\\xrightarrow{\\Delta}2V+5CaO}$ | (III) Decomposition |\n| (D) $\\mathrm{2H_2O_2\\xrightarrow{\\Delta}2H_2O+O_2}$ | (IV) Displacement |\n\nChoose the correct answer:",
        "needs_image": False, "question_image": None,
    },
    ("JEE-MAIN-25-28JAN-S2", 30): {
        "question": "Match List-I with List-II.\n\n| List-I | List-II: Dimensions |\n|---|---|\n| (A) Angular impulse | (I) $[M^0L^2T^{-2}]$ |\n| (B) Latent heat | (II) $[ML^2T^{-3}A^{-1}]$ |\n| (C) Electrical resistivity | (III) $[ML^2T^{-1}]$ |\n| (D) Electromotive force | (IV) $[ML^3T^{-3}A^{-2}]$ |\n\nChoose the correct answer:",
        "needs_image": False, "question_image": None,
    },
    ("JEE-MAIN-25-28JAN-S2", 55): {
        "question": "Match List-I with List-II.\n\n| List-I: Complex | List-II: Hybridisation of central metal ion |\n|---|---|\n| (A) $\\mathrm{[CoF_6]^{3-}}$ | (I) $d^2sp^3$ |\n| (B) $\\mathrm{[NiCl_4]^{2-}}$ | (II) $sp^3$ |\n| (C) $\\mathrm{[Co(NH_3)_6]^{3+}}$ | (III) $sp^3d^2$ |\n| (D) $\\mathrm{[Ni(CN)_4]^{2-}}$ | (IV) $dsp^2$ |\n\nChoose the correct answer:",
        "needs_image": False, "question_image": None,
    },
    ("JEE-MAIN-25-28JAN-S2", 66): {
        "question": "Match List-I with List-II.\n\n| List-I: Saccharide | List-II: Glycosidic linkage |\n|---|---|\n| (A) Sucrose | (I) $\\alpha(1\\rightarrow1)$ |\n| (B) Maltose | (II) $\\alpha(1\\rightarrow4)$ and $\\alpha(1\\rightarrow6)$ |\n| (C) Lactose | (III) $\\alpha1\\rightarrow\\beta2$ |\n| (D) Amylopectin | (IV) $\\beta(1\\rightarrow4)$ |\n\nChoose the correct answer:",
        "needs_image": False, "question_image": None,
    },
    ("JEE-MAIN-25-29JAN-S1", 37): {
        "question": "Match List-I with List-II.\n\n| List-I: Electric field | List-II |\n|---|---|\n| (A) Inside a uniformly charged spherical shell | (I) $\\sigma/\\varepsilon_0$ |\n| (B) Due to a uniformly charged infinite plane sheet | (II) $\\sigma/(2\\varepsilon_0)$ |\n| (C) Outside a uniformly charged spherical shell | (III) $0$ |\n| (D) Between two oppositely charged infinite parallel sheets | (IV) $\\sigma R^2/(\\varepsilon_0r^2)$ |\n\nChoose the correct answer:",
    },
    ("JEE-MAIN-25-29JAN-S1", 51): {
        "question": "Match List-I with List-II.\n\n| List-I: Complex | List-II: Hybridisation and magnetic character |\n|---|---|\n| (A) $\\mathrm{[MnBr_4]^{2-}}$ | (I) $d^2sp^3$, diamagnetic |\n| (B) $\\mathrm{[FeF_6]^{3-}}$ | (II) $sp^3d^2$, paramagnetic |\n| (C) $\\mathrm{[Co(C_2O_4)_3]^{3-}}$ | (III) $sp^3$, diamagnetic |\n| (D) $\\mathrm{[Ni(CO)_4]}$ | (IV) $sp^3$, paramagnetic |\n\nChoose the correct answer:",
    },
    ("JEE-MAIN-25-29JAN-S1", 58): {
        "question": "Match List-I with List-II.\n\n| List-I: Carbohydrate | List-II: Linkage and source |\n|---|---|\n| (A) Amylose | (I) $\\beta(1\\rightarrow4)$, plant |\n| (B) Cellulose | (II) $\\alpha(1\\rightarrow4)$, animal |\n| (C) Glycogen | (III) $\\alpha(1\\rightarrow4)$ and $\\alpha(1\\rightarrow6)$, plant |\n| (D) Amylopectin | (IV) $\\alpha(1\\rightarrow4)$, plant |\n\nChoose the correct answer:",
    },
    ("JEE-MAIN-25-29JAN-S2", 32): {
        "question": "Match List-I with List-II.\n\n| List-I | List-II: Dimensions |\n|---|---|\n| (A) Young's modulus | (I) $[ML^{-1}T^{-1}]$ |\n| (B) Torque | (II) $[ML^{-1}T^{-2}]$ |\n| (C) Coefficient of viscosity | (III) $[M^{-1}L^3T^{-2}]$ |\n| (D) Gravitational constant | (IV) $[ML^2T^{-2}]$ |\n\nChoose the correct answer:",
        "needs_image": False, "question_image": None,
    },
    ("JEE-MAIN-25-29JAN-S2", 43): {
        "question": "Match List-I with List-II.\n\n| List-I | List-II |\n|---|---|\n| (A) Magnetic induction | (I) Ampere metre |\n| (B) Magnetic intensity | (II) Weber |\n| (C) Magnetic flux | (III) Gauss |\n| (D) Magnetic moment | (IV) Ampere/metre |\n\nChoose the correct answer:",
    },
    ("JEE-MAIN-25-29JAN-S2", 57): {
        "question": "Match List-I with List-II.\n\n| List-I: Application | List-II: Battery/Cell |\n|---|---|\n| (A) Transistors | (I) Anode: Zn/Hg; cathode: $\\mathrm{HgO+C}$ |\n| (B) Hearing aids | (II) Hydrogen fuel cell |\n| (C) Inverters | (III) Anode: Zn; cathode: carbon |\n| (D) Apollo spacecraft | (IV) Anode: Pb; cathode: $\\mathrm{Pb/PbO_2}$ |\n\nChoose the correct answer:",
        "needs_image": False, "question_image": None,
    },
    ("JEE-MAIN-25-28JAN-S2", 8): {
        "chapter": "Definite Integrals",
        "question": "Let $f$ be a real-valued continuous function defined on the positive real axis such that $g(x)=\\displaystyle\\int_0^x t f(t)\\,dt$. If $g(x^3)=x^6+x^7$, then the value of $\\displaystyle\\sum_{r=1}^{15} f(r^3)$ is:",
    },
    ("JEE-MAIN-25-23JAN-S1", 26): {
        "option_a": "$a/r \\approx 10$", "option_b": "$a/r \\approx 20$",
        "option_c": "$a/r \\approx 0.5$", "option_d": "$a/r \\approx 3$",
    },
    ("JEE-MAIN-25-23JAN-S1", 30): {
        "question": "For the circuit shown, which observations are correct? A. The total circuit resistance is $6\\,\\Omega$. B. The ammeter current is $1\\,\\text{A}$. C. The potential across $AB$ is $4\\,\\text{V}$. D. The potential across $CD$ is $4\\,\\text{V}$. E. The total circuit resistance is $8\\,\\Omega$.",
    },
    ("JEE-MAIN-25-23JAN-S1", 53): {
        "question": "The standard reduction potentials in the sequence $\\mathrm{FeO_4^{2-} \\xrightarrow{2.0\\,V} Fe^{3+} \\xrightarrow{0.8\\,V} Fe^{2+} \\xrightarrow{-0.5\\,V} Fe}$ are shown over the arrows. The value of $E^\\circ_{\\mathrm{FeO_4^{2-}/Fe^{2+}}}$ is:",
    },
    ("JEE-MAIN-25-23JAN-S2", 17): {
        "question": "A $4\\times4$ board consists of 16 unit squares. Two of the 16 squares are chosen at random. The probability that they have no side in common is:",
    },
    ("JEE-MAIN-25-24JAN-S2", 38): {
        "question": "Four equal charges $+q_0$ are initially placed at the vertices of a square of side $a$ as shown in Configuration (1). They are moved to the midpoints of the four sides as shown in Configuration (2). The work required for this redistribution is:",
    },
    ("JEE-MAIN-25-24JAN-S2", 43): {
        "question": "In a Young's double-slit experiment, polarizers $P_1$ and $P_2$ cover the two slits and have mutually orthogonal transmission axes. A third polarizer $P_3$ covers both slits with its transmission axis at $45^\\circ$ to those of $P_1$ and $P_2$. Unpolarized light of wavelength $\\lambda$ and intensity $I_0$ is incident on $P_1$ and $P_2$. The intensity beyond $P_3$ at a point where the path difference is $\\lambda/3$ is:",
        "option_a": "$I_0/2$", "option_b": "$I_0/4$", "option_c": "$I_0/3$", "option_d": "$I_0$",
    },
}

HEADER = re.compile(r"2\s*025 \([^\n]+\) JEE Main Previous Year Paper|JEE Main 2025 January MathonGo", re.I)
PROMO = re.compile(r"Join the Most Relevant Test Series.*?(?:https?://\S+|$)", re.I)
META = re.compile(r"Question ID\s*:.*", re.I | re.S)


def subject(number: int) -> str:
    return "Maths" if number <= 25 else "Physics" if number <= 50 else "Chemistry"


def clean(value: str) -> str:
    value = HEADER.sub(" ", value)
    value = PROMO.sub(" ", value)
    value = META.sub(" ", value)
    value = value.replace("\u00a0", " ").replace("^i", "î").replace("^j", "ĵ").replace("k^", "k̂")
    value = re.sub(r"(?<=\b[A-Za-z])\s+(?=\d\b)", "_", value)
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\s+([,.;:])", r"\1", value)
    value = re.sub(r"\n\s*\n+", "\n", value)
    return value.strip()


def flatten(value: str) -> str:
    return re.sub(r"\s+", " ", clean(value)).strip()


def parse_chunks(pdf_path: Path) -> tuple[dict[int, str], dict[int, str]]:
    with pdfplumber.open(pdf_path) as document:
        text = "\n".join(page.extract_text(x_tolerance=1, y_tolerance=3) or "" for page in document.pages)
    answer_start = text.rfind("ANSWER KEYS")
    if answer_start < 0:
        raise RuntimeError(f"{pdf_path.name}: missing answer key")
    answer_text = text[answer_start:]
    keys = {int(number): value.strip() for number, value in re.findall(r"\b(\d{1,2})\.\s*\(([^)]+)\)", answer_text)}
    if sorted(keys) != list(range(1, 76)):
        raise RuntimeError(f"{pdf_path.name}: invalid answer key: {sorted(keys)}")
    text = text[:answer_start]
    marks = list(re.finditer(r"(?m)^[^A-Za-z0-9\n]{0,8}Q\s*\.?\s*(\d{1,2})\.", text))
    numbers = [int(mark.group(1)) for mark in marks]
    if numbers != list(range(1, 76)):
        raise RuntimeError(f"{pdf_path.name}: invalid question anchors: {numbers}")
    chunks = {}
    for index, mark in enumerate(marks):
        end = marks[index + 1].start() if index + 1 < len(marks) else len(text)
        chunks[int(mark.group(1))] = text[mark.start():end]
    return chunks, keys


def split_question(chunk: str, number: int, question_type: str) -> tuple[str, list[str]]:
    chunk = re.sub(rf"^[^A-Za-z0-9\n]*Q\s*\.?\s*{number}\.", "", chunk).strip()
    if question_type == "NUMERICAL":
        return flatten(chunk), []
    markers = list(re.finditer(r"\(\s*([1-4])\s*\)", chunk))
    if len(markers) < 4:
        raise RuntimeError(f"Q{number}: found only {len(markers)} option markers")
    prompt = flatten(chunk[:markers[0].start()])
    options = []
    for index, marker in enumerate(markers[:4]):
        end = markers[index + 1].start() if index < 3 else len(chunk)
        options.append(flatten(chunk[marker.end():end]))
    return prompt, options


def decode_image(item: dict) -> Image.Image:
    width, height = item["srcsize"]
    data = item["stream"].get_data()
    pixels = width * height
    if len(data) == pixels:
        return Image.frombytes("L", (width, height), data).convert("RGB")
    if len(data) == pixels * 3:
        return Image.frombytes("RGB", (width, height), data)
    if len(data) == pixels * 4:
        return Image.frombytes("CMYK", (width, height), data).convert("RGB")
    return Image.open(BytesIO(data)).convert("RGB")


def tight_crop(image: Image.Image, padding: int = 14) -> Image.Image:
    image = image.convert("RGB")
    background = Image.new("RGB", image.size, "white")
    difference = ImageChops.difference(image, background).convert("L")
    difference = difference.point(lambda value: 255 if value > 12 else 0)
    box = difference.getbbox()
    if not box:
        return image
    left, top, right, bottom = box
    return image.crop((max(0, left-padding), max(0, top-padding), min(image.width, right+padding), min(image.height, bottom+padding)))


def remove_blue_watermark(image: Image.Image) -> Image.Image:
    image = image.convert("RGB")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue = pixels[x, y]
            if min(red, green, blue) > 175 or (red > 140 and blue > red + 5 and green >= red):
                pixels[x, y] = (255, 255, 255)
    return image


def combine(images: list[Image.Image]) -> Image.Image:
    images = [tight_crop(image) for image in images]
    padding, gap = 14, 10
    width = max(image.width for image in images) + 2 * padding
    height = sum(image.height for image in images) + gap * (len(images)-1) + 2 * padding
    output = Image.new("RGB", (width, height), "white")
    y = padding
    for image in images:
        output.paste(image, ((width-image.width)//2, y))
        y += image.height + gap
    return tight_crop(output, 10)


def extract_required_images(pdf_path: Path, paper_code: str) -> dict[int, str]:
    grouped: dict[int, list[Image.Image]] = defaultdict(list)
    with pdfplumber.open(pdf_path) as document:
        for page in document.pages:
            anchors = []
            for word in page.extract_words(x_tolerance=1, y_tolerance=3):
                match = re.search(r"Q\s*\.?\s*(\d{1,2})\.?", word["text"])
                if match:
                    anchors.append((int(match.group(1)), float(word["top"])))
            anchors.sort(key=lambda item: item[1])
            for item in page.images:
                width, height = float(item["width"]), float(item["height"])
                # Logos, rules, and tiny glyph fragments are not question diagrams.
                if width < 45 or height < 35 or width > page.width * 0.9:
                    continue
                preceding = [anchor for anchor in anchors if anchor[1] <= float(item["top"]) + 5]
                if not preceding:
                    continue
                number = preceding[-1][0]
                try:
                    image = decode_image(item)
                except Exception:
                    continue
                if image.width < 60 or image.height < 45:
                    continue
                grouped[number].append(image)
    image_dir = OUT / paper_code / "required-images"
    image_dir.mkdir(parents=True, exist_ok=True)
    for old in image_dir.glob("q*.png"):
        old.unlink()
    result = {}
    for number, images in sorted(grouped.items()):
        output = combine(images)
        path = image_dir / f"q{number:02}.png"
        output.save(path, optimize=True)
        result[number] = str(path)
    with pdfplumber.open(pdf_path) as document:
        for (clip_code, number), (page_number, box) in MANUAL_IMAGE_CLIPS.items():
            if clip_code != paper_code:
                continue
            rendered = document.pages[page_number-1].crop(box).to_image(resolution=240).original
            output = tight_crop(remove_blue_watermark(rendered), 12)
            path = image_dir / f"q{number:02}.png"
            output.save(path, optimize=True)
            result[number] = str(path)
    return result


def repair_missing_options(pdf_path: Path, paper_code: str, rows: list[dict]) -> None:
    """Recover skipped two-column/graphical MCQ options from positioned PDF cells."""
    output_dir = OUT / paper_code / "option-images"
    output_dir.mkdir(parents=True, exist_ok=True)
    with pdfplumber.open(pdf_path) as document:
        anchors = []
        for page_index, page in enumerate(document.pages):
            for word in page.extract_words(x_tolerance=1, y_tolerance=3):
                match = re.search(r"Q\s*\.?\s*(\d{1,2})\.?", word["text"])
                if match:
                    anchors.append((int(match.group(1)), page_index, float(word["top"])))
        anchors.sort()
        for row in rows:
            if row["question_type"] != "MCQ":
                continue
            # Always reconstruct MCQ options from their positioned cells. The
            # linear PDF text stream interleaves the left and right columns.
            missing = [1, 2, 3, 4]
            anchor = next((item for item in anchors if item[0] == row["number"]), None)
            if anchor is None:
                raise RuntimeError(f"{paper_code} Q{row['number']}: positioned question anchor not found")
            next_anchor = next((item for item in anchors if item[0] == row["number"] + 1), None)
            candidates = []
            for page_index in range(anchor[1], (next_anchor[1] if next_anchor else anchor[1]) + 1):
                page = document.pages[page_index]
                top_limit = anchor[2] if page_index == anchor[1] else 0
                bottom_limit = next_anchor[2] if next_anchor and page_index == next_anchor[1] else page.height
                for word in page.extract_words(x_tolerance=1, y_tolerance=3):
                    marker = re.fullmatch(r"\(([1-4])\)", word["text"])
                    if marker and top_limit <= float(word["top"]) < bottom_limit:
                        candidates.append((int(marker.group(1)), page_index, word))
            by_number = {number: (page_index, word) for number, page_index, word in candidates}

            # Re-read the prompt from its visual rectangle so text belonging to
            # two-column options cannot leak into the question statement.
            if (paper_code, row["number"]) not in MANUAL_OVERRIDES or "question" not in MANUAL_OVERRIDES[(paper_code, row["number"])]:
                prompt_page = document.pages[anchor[1]]
                first_option_top = min(
                    (float(word["top"]) for _, page_index, word in candidates if page_index == anchor[1]),
                    default=(next_anchor[2] - 3 if next_anchor and next_anchor[1] == anchor[1] else prompt_page.height - 18),
                )
                prompt_box = (18, max(0, anchor[2] - 4), prompt_page.width - 18, first_option_top - 2)
                positioned_prompt = flatten(prompt_page.crop(prompt_box).extract_text(x_tolerance=1, y_tolerance=3) or "")
                question_token = re.search(rf"Q\s*\.?\s*{row['number']}\.?\s*", positioned_prompt)
                if question_token:
                    leading_math = positioned_prompt[:question_token.start()].strip()
                    positioned_prompt = positioned_prompt[question_token.end():].strip()
                    if leading_math:
                        positioned_prompt = f"{positioned_prompt} {leading_math}"
                if positioned_prompt:
                    row["question"] = positioned_prompt

            for option_number in missing:
                if option_number not in by_number:
                    continue
                page_index, marker = by_number[option_number]
                page = document.pages[page_index]
                is_left = float(marker["x0"]) < page.width * 0.45
                same_column_below = [
                    word for number, candidate_page, word in candidates
                    if candidate_page == page_index
                    and (float(word["x0"]) < page.width * 0.45) == is_left
                    and float(word["top"]) > float(marker["top"]) + 2
                ]
                bottom = min((float(word["top"]) - 3 for word in same_column_below), default=(
                    next_anchor[2] - 3 if next_anchor and next_anchor[1] == page_index else page.height - 18
                ))
                left = float(marker["x1"]) + 2
                right = page.width / 2 - 5 if is_left else page.width - 18
                box = (left, max(0, float(marker["top"]) - 5), right, max(float(marker["bottom"]) + 5, bottom))
                cell = page.crop(box)
                recovered = flatten(cell.extract_text(x_tolerance=1, y_tolerance=3) or "")
                key = ("option_a", "option_b", "option_c", "option_d")[option_number - 1]
                image_key = f"{key}_image"
                manual = MANUAL_OVERRIDES.get((paper_code, row["number"]), {})
                if key in manual and manual[key]:
                    row.pop(image_key, None)
                    continue
                row[key] = recovered
                rendered = cell.to_image(resolution=240).original
                rendered = tight_crop(remove_blue_watermark(rendered), 10)
                image_path = output_dir / f"q{row['number']:02}-{key}.png"
                rendered.save(image_path, optimize=True)
                # Stacked fractions, roots, matrices, and other 2-D notation
                # cannot be represented faithfully by the PDF's flat text
                # stream. Keep the exact cleaned crop for those cells.
                if not recovered:
                    row[key] = ""
                    row[image_key] = str(image_path)
                else:
                    row.pop(image_key, None)

            # In a two-column/two-row option grid, some PDF text layers append
            # the lower-left cell to A and the lower-right cell to B. Remove
            # only an exact, space-delimited suffix; this avoids false matches
            # such as option "NAND gate" containing "AND gate".
            for upper_key, lower_key in (("option_a", "option_c"), ("option_b", "option_d")):
                upper, lower = str(row.get(upper_key) or ""), str(row.get(lower_key) or "")
                suffix = f" {lower}"
                if lower and upper.endswith(suffix) and len(upper[:-len(suffix)].strip()) >= 2:
                    row[upper_key] = upper[:-len(suffix)].strip()

        # Some option groups start at the very top of the following page and
        # therefore have no detectable marker inside the question's text span.
        for (clip_code, number), option_clips in MANUAL_OPTION_CLIPS.items():
            if clip_code != paper_code:
                continue
            row = rows[number - 1]
            for key, (page_number, box) in option_clips.items():
                rendered = document.pages[page_number - 1].crop(box).to_image(resolution=240).original
                rendered = tight_crop(remove_blue_watermark(rendered), 10)
                image_path = output_dir / f"q{number:02}-{key}.png"
                rendered.save(image_path, optimize=True)
                row[f"{key}_image"] = str(image_path)


def prepare(paper_code: str, pdf_path: Path) -> dict:
    manifest = json.loads((OUT / paper_code / "manifest.json").read_text())
    chunks, answer_keys = parse_chunks(pdf_path)
    images = extract_required_images(pdf_path, paper_code)
    rows = []
    for number in range(1, 76):
        official = manifest[number-1]
        if official["number"] != number:
            raise RuntimeError(f"{paper_code}: manifest order mismatch at Q{number}")
        question_type = official["question_type"]
        prompt, options = split_question(chunks[number], number, question_type)
        if not prompt and number in images:
            prompt = "Study the given diagram and choose the correct option."
        if not prompt or re.search(r"refer to (the )?(source )?image", prompt, re.I):
            raise RuntimeError(f"{paper_code} Q{number}: invalid prompt")
        answer = answer_keys[number]
        row = {
            "number": number,
            "subject": subject(number),
            "chapter": "Unmapped",
            "question_type": question_type,
            "question": prompt,
            "option_a": options[0] if options else "",
            "option_b": options[1] if options else "",
            "option_c": options[2] if options else "",
            "option_d": options[3] if options else "",
            "correct_option": (
                "ABCD"[int(answer)-1]
                if question_type == "MCQ" and answer in {"1", "2", "3", "4"}
                else None
            ),
            "numerical_answer": float(answer) if question_type == "NUMERICAL" and not answer.upper().startswith("DROP") else None,
            "needs_image": number in images,
            "question_image": images.get(number),
        }
        row.update(MANUAL_OVERRIDES.get((paper_code, number), {}))
        rows.append(row)
    repair_missing_options(pdf_path, paper_code, rows)
    return rows


def main() -> None:
    selected = sys.argv[1:] or list(PAPERS)
    report = []
    for paper_code in selected:
        rows = prepare(paper_code, PAPERS[paper_code])
        path = OUT / paper_code / "structured-dataset.json"
        path.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + "\n")
        report.append({"paper_code": paper_code, "questions": len(rows), "images": [row["number"] for row in rows if row["needs_image"]]})
    report_path = OUT / "text-prepare-report.json"
    report_path.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
