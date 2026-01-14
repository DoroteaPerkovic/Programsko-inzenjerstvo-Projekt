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

    # povratak na sastanke
    
    # hover preko filter ikone da se otvori menu
    filter_icon = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "img.filter"))
    )
    ActionChains(driver).move_to_element(filter_icon).perform()

    # čekamo da se menu pojavi
    menu_item = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//div[@class='Menu']//li[contains(text(), 'Objavljeni')]"))
    )
    test_pass("Hover menu otvoren")

    menu_item.click()
    
    WebDriverWait(driver, 15).until(
        EC.visibility_of_element_located((By.CLASS_NAME, "okvirAS"))
    )
    test_pass("Povratak na /suvlasnici/objavljeni uspješan")
    
    #prelazak na arhivirane
    
    # hover preko filter ikone da se otvori menu
    filter_icon = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "img.filter"))
    )
    ActionChains(driver).move_to_element(filter_icon).perform()

    # čekamo da se menu pojavi
    menu_item = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//div[@class='Menu']//li[contains(text(), 'Arhivirani')]"))
    )
    test_pass("Hover menu otvoren")

    menu_item.click()
    
    WebDriverWait(driver, 15).until(
        EC.visibility_of_element_located((By.CLASS_NAME, "okvirAS"))
    )
    test_pass("Povratak na /suvlasnici/arhivirani uspješan")
    
    #povratak na profil i odjava
    
    profil_link = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "a[href='/profil']")))
    profil_link.click()

    WebDriverWait(driver, 15).until(
        EC.visibility_of_element_located((By.CLASS_NAME, "blockProfila"))
    )
    
    wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[text()='Odjavi se']")
        )
    ).click()
    
    test_pass("Uspješna odjava")
    

except Exception as e:
    test_fail(f"Test prekinut zbog greške: {e}")

finally:
    try:
        driver.quit()
    except:
        pass