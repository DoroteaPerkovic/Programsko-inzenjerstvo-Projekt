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

    profil_link = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "a[href='/profil']"))
    )
    profil_link.click()

    wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[text()='Odjavi se']"))
    ).click()

    wait.until(EC.visibility_of_element_located((By.ID, "usernameOrEmail")))
    test_pass("Odjava uspješna - login forma vidljiva")

    driver.refresh()

    wait.until(EC.visibility_of_element_located((By.ID, "usernameOrEmail")))
    test_pass("Nakon refresh-a korisnik ostaje odjavljen (login forma)")

except Exception as e:
    test_fail(f"Test prekinut zbog greške: {e}")

finally:
    try:
        driver.quit()
    except:
        pass