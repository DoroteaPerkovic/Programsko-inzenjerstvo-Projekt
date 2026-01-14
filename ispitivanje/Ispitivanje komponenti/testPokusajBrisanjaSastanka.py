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
    # prijava kao predstavnik
    username = wait.until(EC.visibility_of_element_located((By.ID, "usernameOrEmail")))
    username.send_keys("boki")

    password = wait.until(EC.visibility_of_element_located((By.ID, "password")))
    password.send_keys("luk123")
    password.send_keys(Keys.ENTER)
        
    #prelazak na planirane
    wait.until(
        EC.invisibility_of_element_located((By.XPATH, "//p[text()='Učitavanje sastanaka...']"))
    )
    # hover preko filter ikone da se otvori menu
    filter_icon = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "img.filter"))
    )
    ActionChains(driver).move_to_element(filter_icon).perform()

    # čekamo da se menu pojavi
    menu_item = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//div[@class='Menu']//li[contains(text(), 'Planirani')]"))
    )
    menu_item.click()
    
    #provjera da ne postoji gumb "Obriši" nigdje na stranici planiranih sastanaka
    try:
        driver.find_element(By.XPATH, "//*[contains(text(), 'Obriši') or contains(text(), 'Obrisi')]")
        test_fail("Nepostojeća funkcionalnost: pronađen gumb 'Obriši' na stranici planiranih sastanaka")
    except:
        test_pass("Nepostojeća funkcionalnost: gumb 'Obriši' ne postoji na stranici planiranih sastanaka")
    
    #prelazak na objavljenje
    wait.until(
        EC.invisibility_of_element_located((By.XPATH, "//p[text()='Učitavanje sastanaka...']"))
    )
    # hover preko filter ikone da se otvori menu
    filter_icon = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "img.filter"))
    )
    ActionChains(driver).move_to_element(filter_icon).perform()

    # čekamo da se menu pojavi
    menu_item = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//div[@class='Menu']//li[contains(text(), 'Objavljeni')]"))
    )
    menu_item.click()
        
    #provjera da ne postoji gumb "Obriši" nigdje na stranici objavljenih sastanaka
    try:
        driver.find_element(By.XPATH, "//*[contains(text(), 'Obriši') or contains(text(), 'Obrisi')]")
        test_fail("Nepostojeća funkcionalnost: pronađen gumb 'Obriši' na stranici objavljenih sastanaka")
    except:
        test_pass("Nepostojeća funkcionalnost: gumb 'Obriši' ne postoji na stranici objavljenih sastanaka")
    
    #prelazak na obavljene
    wait.until(
        EC.invisibility_of_element_located((By.XPATH, "//p[text()='Učitavanje sastanaka...']"))
    )
    # hover preko filter ikone da se otvori menu
    filter_icon = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "img.filter"))
    )
    ActionChains(driver).move_to_element(filter_icon).perform()

    # čekamo da se menu pojavi
    menu_item = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//div[@class='Menu']//li[contains(text(), 'Obavljeni')]"))
    )
    menu_item.click()
    
    #provjera da ne postoji gumb "Obriši" nigdje na stranici obavljenih sastanaka
    try:
        driver.find_element(By.XPATH, "//*[contains(text(), 'Obriši') or contains(text(), 'Obrisi')]")
        test_fail("Nepostojeća funkcionalnost: pronađen gumb 'Obriši' stranici obavljenih sastanaka")
    except:
        test_pass("Nepostojeća funkcionalnost: gumb 'Obriši' ne postoji stranici obavljenih sastanaka")

    #prelazak na arhivirane
    wait.until(
        EC.invisibility_of_element_located((By.XPATH, "//p[text()='Učitavanje sastanaka...']"))
    )
    # hover preko filter ikone da se otvori menu
    filter_icon = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "img.filter"))
    )
    ActionChains(driver).move_to_element(filter_icon).perform()

    # čekamo da se menu pojavi
    menu_item = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//div[@class='Menu']//li[contains(text(), 'Arhivirani')]"))
    )
    menu_item.click()
    
    #provjera da ne postoji gumb "Obriši" nigdje na stranici arhiviranih sastanaka
    try:
        driver.find_element(By.XPATH, "//*[contains(text(), 'Obriši') or contains(text(), 'Obrisi')]")
        test_fail("Nepostojeća funkcionalnost: pronađen gumb 'Obriši' na stranici arhiviranih sastanaka")
    except:
        test_pass("Nepostojeća funkcionalnost: gumb 'Obriši' ne postoji na stranici arhiviranih sastanaka")
   
except Exception as e:
    test_fail(f"Test prekinut zbog greške: {e}")

finally:
    try:
        driver.quit()
    except:
        pass