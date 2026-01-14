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
    username= wait.until(EC.visibility_of_element_located((By.ID, "usernameOrEmail")))
    wait.until(EC.visibility_of_element_located((By.ID, "password")))
    
    username.send_keys("stanar")

    #namjerno ostavljamo prazno
    password = driver.find_element(By.ID, "password")
    password.send_keys(Keys.ENTER)

    try:
        WebDriverWait(driver, 2).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "okvirAS"))
        )
        test_fail("Prazna polja: neočekivano ulogiran korisnik")
    except:
        test_pass("Prazna polja: korisnik nije ulogiran")

    current_url = driver.current_url
    if "/suvlasnici" in current_url:
        test_fail("Prazna polja: neočekivano preusmjeren na /suvlasnici")
    else:
        test_pass("Prazna polja: nije preusmjeren na /suvlasnici")

except Exception as e:
    test_fail(f"Test prekinut zbog greške: {e}")

finally:
    try:
        driver.quit()
    except:
        pass