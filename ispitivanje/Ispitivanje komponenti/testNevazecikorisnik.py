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
    #pokušavamo se prijaviti kao korisnik koji ne postoji
    username = wait.until(EC.visibility_of_element_located((By.ID, "usernameOrEmail")))
    password = wait.until(EC.visibility_of_element_located((By.ID, "password")))

    username.send_keys("nepostojeci_korisnik_123")
    password.send_keys("kriva_lozinka")
    password.send_keys(Keys.ENTER)

    error_msg = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located(
            (By.XPATH, "//p[contains(text(), 'Pogrešno korisničko ime/email ili lozinka')]")
        )
    )
    test_pass("Nepostojeći korisnik: greška ispravno prikazana")

except Exception as e:
    test_fail(f"Test prekinut zbog greške: {e}")

finally:
    try:
        driver.quit()
    except:
        pass