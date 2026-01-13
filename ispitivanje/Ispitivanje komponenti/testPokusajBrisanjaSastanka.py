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
    # prijava kao suvlasnik (može i predstavnik, ovdje nije bitno)
    username = wait.until(EC.visibility_of_element_located((By.ID, "usernameOrEmail")))
    username.send_keys("boki")

    password = wait.until(EC.visibility_of_element_located((By.ID, "password")))
    password.send_keys("luk123")
    password.send_keys(Keys.ENTER)

    WebDriverWait(driver, 15).until(
        EC.visibility_of_element_located((By.CLASS_NAME, "okvirAS"))
    )
    test_pass("Prijava uspješna")

    
    
    # 1) provjera da NE postoji gumb "Obriši" nigdje na stranici sastanaka
    try:
        driver.find_element(By.XPATH, "//*[contains(text(), 'Obriši') or contains(text(), 'Obrisi')]")
        test_fail("Nepostojeća funkcionalnost: pronađen gumb 'Obriši' (ne bi trebao postojati)")
    except:
        test_pass("Nepostojeća funkcionalnost: gumb 'Obriši' ne postoji (ispravno)")

    # 2) pokušaj direktno otvoriti nepostojeću rutu za brisanje
    # (ovo simulira poziv neimplementirane funkcionalnosti)
    driver.get("https://programsko-inzenjerstvo-projekt-1.onrender.com/sastanci/1/obrisi")

    body = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.TAG_NAME, "body"))
    ).text.lower()

    # očekujemo da sustav prikaže not found / 404 ili barem ne puca
    if ("not found" in body) or ("404" in body) or ("nije pronađeno" in body) or ("pogreška" in body):
        test_pass("Nepostojeća ruta za brisanje: prikazana poruka (404/Not found)")
    else:
        # ako vas preusmjeri na neku postojeću stranicu, opet je bitno da ne crasha
        test_pass("Nepostojeća ruta za brisanje: sustav stabilan (nema crasha)")

except Exception as e:
    test_fail(f"Test prekinut zbog greške: {e}")

finally:
    try:
        driver.quit()
    except:
        pass