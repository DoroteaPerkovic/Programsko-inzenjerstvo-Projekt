from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_pass(poruka):
    print("PASS: " + poruka)

def test_fail(poruka):
    print("FAIL: " + poruka)

driver = webdriver.Chrome()
driver.get("https://programsko-inzenjerstvo-projekt-1.onrender.com/profil")

wait = WebDriverWait(driver, 10)

try:
    # očekujemo da će nas baciti na login ili prikazati login formu
    wait.until(EC.visibility_of_element_located((By.ID, "usernameOrEmail")))
    test_pass("Profil bez prijave: pristup blokiran i prikazan login")

except Exception as e:
    test_fail(f"Test prekinut zbog greške: {e}")

finally:
    try:
        driver.quit()
    except:
        pass