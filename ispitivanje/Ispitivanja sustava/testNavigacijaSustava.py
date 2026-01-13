from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

def test_pass(poruka):
    print("PASS: " + poruka)

def test_fail(poruka):
    print("FAIL: " + poruka)

driver = webdriver.Chrome()
driver.get("https://programsko-inzenjerstvo-projekt-1.onrender.com")

wait = WebDriverWait(driver, 10)

try:
    username = wait.until(EC.visibility_of_element_located((By.ID, "usernameOrEmail")))
    username.send_keys("stanar")

    password = wait.until(EC.visibility_of_element_located((By.ID, "password")))
    password.send_keys("stanar123")
    password.send_keys(Keys.ENTER)

    WebDriverWait(driver, 15).until(
        EC.visibility_of_element_located((By.CLASS_NAME, "okvirAS"))
    )

    test_pass("Login uspješan")

    # odlazak na profil
    profil_link = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "a[href='/profil']")))
    profil_link.click()

    WebDriverWait(driver, 15).until(
        EC.visibility_of_element_located((By.CLASS_NAME, "blockProfila"))
    )
    test_pass("Otvoren profil")

    # povratak na suvlasnici (klik na link ako postoji, ili direktno)
    driver.get("https://programsko-inzenjerstvo-projekt-1.onrender.com/suvlasnici")

    WebDriverWait(driver, 15).until(
        EC.visibility_of_element_located((By.CLASS_NAME, "okvirAS"))
    )
    test_pass("Povratak na /suvlasnici uspješan")

except Exception as e:
    test_fail(f"Test prekinut zbog greške: {e}")

finally:
    try:
        driver.quit()
    except:
        pass