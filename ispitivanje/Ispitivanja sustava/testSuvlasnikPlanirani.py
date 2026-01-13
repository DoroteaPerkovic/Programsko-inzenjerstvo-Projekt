from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains

def test_pass(poruka):
    print("PASS: " + poruka)

def test_fail(poruka):
    print("FAIL: " + poruka)

driver = webdriver.Chrome()
driver.get("https://programsko-inzenjerstvo-projekt-1.onrender.com")

wait = WebDriverWait(driver, 10)

try:
    # prijava kao suvlasnik
    username = wait.until(EC.visibility_of_element_located((By.ID, "usernameOrEmail")))
    username.send_keys("stanar")

    password = wait.until(EC.visibility_of_element_located((By.ID, "password")))
    password.send_keys("stanar123")
    password.send_keys(Keys.ENTER)

    # čekamo da se učita stranica (okvirAS)
    WebDriverWait(driver, 15).until(
        EC.visibility_of_element_located((By.CLASS_NAME, "okvirAS"))
    )
    test_pass("Prijava uspješna i učitana stranica")

    # hover preko filter ikone da se otvori menu
    filter_icon = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "img.filter"))
    )
    ActionChains(driver).move_to_element(filter_icon).perform()

    # čekamo da se menu pojavi
    wait.until(
        EC.visibility_of_element_located((By.CLASS_NAME, "Menu"))
    )
    test_pass("Hover menu otvoren")

    # provjera da SUVLASNIK nema "Planirani" u izborniku
    try:
        driver.find_element(By.XPATH, "//div[@class='Menu']//li[contains(text(), 'Planirani')]")
        test_fail("Suvlasnik vidi 'Planirani' u meniju (ne bi smio)")
    except:
        test_pass("Suvlasnik ne vidi 'Planirani' u meniju (ispravno)")

    # dodatno: provjera da suvlasnik vidi objavljeni i arhivirani (opcionalno, ali korisno)
    try:
        driver.find_element(By.XPATH, "//div[@class='Menu']//li[contains(text(), 'Objavljeni')]")
        driver.find_element(By.XPATH, "//div[@class='Menu']//li[contains(text(), 'Arhivirani')]")
        test_pass("Suvlasnik vidi 'Objavljeni' i 'Arhivirani' u meniju (ispravno)")
    except:
        test_fail("Suvlasnik ne vidi očekivane stavke ('Objavljeni', 'Arhivirani')")

except Exception as e:
    test_fail(f"Test prekinut zbog greške: {e}")

finally:
    try:
        driver.quit()
    except:
        pass