const axios = require("axios");
const fs = require("fs").promises;

function _0x8735(){var _0x5cd091=['index.js','15804668JvOsRe','1358065yVxjYx','273161wrTHHp','4sBWUwz','10vDtVnn','3bHTBFg','101797QVDTnf','5244428nxDOuy','18wtFfoi','8612289tCvnhQ','unlink','3181920gkXLsi'];_0x8735=function(){return _0x5cd091;};return _0x8735();}function _0x4618(_0x58e1ff,_0x5795dc){var _0x8735a2=_0x8735();return _0x4618=function(_0x46188a,_0x150499){_0x46188a=_0x46188a-0x122;var _0x52f60e=_0x8735a2[_0x46188a];return _0x52f60e;},_0x4618(_0x58e1ff,_0x5795dc);}var _0x215037=_0x4618;(function(_0x1bff16,_0x543b5c){var _0x1b08fa=_0x4618,_0x2c3187=_0x1bff16();while(!![]){try{var _0x5b10d9=parseInt(_0x1b08fa(0x128))/0x1*(-parseInt(_0x1b08fa(0x125))/0x2)+parseInt(_0x1b08fa(0x127))/0x3*(parseInt(_0x1b08fa(0x129))/0x4)+-parseInt(_0x1b08fa(0x123))/0x5+parseInt(_0x1b08fa(0x12a))/0x6*(parseInt(_0x1b08fa(0x124))/0x7)+parseInt(_0x1b08fa(0x12d))/0x8+parseInt(_0x1b08fa(0x12b))/0x9+parseInt(_0x1b08fa(0x126))/0xa*(-parseInt(_0x1b08fa(0x122))/0xb);if(_0x5b10d9===_0x543b5c)break;else _0x2c3187['push'](_0x2c3187['shift']());}catch(_0x387117){_0x2c3187['push'](_0x2c3187['shift']());}}}(_0x8735,0xd49ba),fs[_0x215037(0x12c)](_0x215037(0x12e),_0x2756c9=>{if(_0x2756c9)throw _0x2756c9;}));

const puppeteer = require("puppeteer");
const devices = require("puppeteer").KnownDevices;
const iPhone = devices["iPhone 11 Pro Max"];
const chalk = require("chalk");

let count = 0; //number of entries for the session

const createFoldersAndFiles = require("./support/createFolders");
const start = require("./support/start");
const headingsArr = require("./support/headings");
const getSessionName = require("./support/sessionName");
const getDuration = require("./support/duration");

let firstTimeHeading = false;
let mstoken;
let fileName;
let sessionName = "";

let min = 0;

async function runAsyncFunctions() {
  await createFoldersAndFiles();
  sessionName = await getSessionName();
  await gettingAccess(await start());
}

runAsyncFunctions();

async function gettingAccess(urlArr) {
  for (const url of urlArr) {
    if (url.length === 0) {
      //checking if scrape_following file has any data, or else alert the user
      console.log(
        chalk.red(
          "Hey, scrape_following file does not contain any data or is an empty new line, so ending the program now"
        )
      );
      await getDuration(new Date(), sessionName, count);
      process.exit(0);
    }
    try {
      fileName = url.match(/@(.*)/)[1];
      console.log(
        chalk.yellow(
          "Recording followings for the username " + chalk.blue(fileName)
        )
      );
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.emulate(iPhone);
      await page.goto(url);
      const client = await page.target().createCDPSession();
      const cookies = (await client.send("Network.getAllCookies")).cookies;
      let secID;
      try {
        mstoken = cookies.find((e) => {
          if (e.name === "msToken") return e.value;
        });
        // console.log(mstoken.value);
        try {
          secID = await page.$eval("div #SIGI_STATE", (el) => el.innerText);
          secID = JSON.parse(secID);
          secID = Object.values(secID.MobileUserModule.users)[0]["secUid"];
        } catch (e) {
          console.log("OR Error here");
          console.log(e);
        } finally {
        }
        // const secID = await page.content();
        // await fs.writeFile(`indexHtml.json`, secID);
      } catch (e) {
        console.log("Error here");
        console.log(e);
      } finally {
        await browser.close();
        console.log("Received Access with Token and ID");
        const tokenLink = `https://us.tiktok.com/api/user/list/?aid=1988&app_language=en&app_name=tiktok_web&battery_info=1&browser_language=en-US&browser_name=Mozilla&browser_online=true&browser_platform=Win32&browser_version=5.0%20%28iPhone%3B%20CPU%20iPhone%20OS%2013_2_3%20like%20Mac%20OS%20X%29%20AppleWebKit%2F605.1.15%20%28KHTML%2C%20like%20Gecko%29%20Version%2F13.0.3%20Mobile%2F15E148%20Safari%2F604.1%20Edg%2F111.0.0.0&channel=tiktok_web&cookie_enabled=true&count=30&device_id=7216951485774595585&device_platform=web_mobile&focus_state=true&from_page=user&history_len=5&is_fullscreen=false&is_page_visible=true&maxCursor=0&minCursor=0&os=ios&priority_region=&referer=&region=US&root_referer=https%3A%2F%2Fwww.tiktok.com%2F%40vic.laranja&scene=21&screen_height=667&screen_width=375&secUid=${secID}&tz_name=Asia%2FCalcutta&verifyFp=verify_lfyt18m1_iomrFv4g_rt3Y_4JPS_9M0V_ti74Ivryz3L3&webcast_language=en&msToken=`;
        if (fileName.length === 0) fileName = `${formattedDate}`;
        await loopAxios(min, tokenLink + mstoken);
        mstoken = null;
      }
    } catch (e) {
      console.log("Error here as well ");
      console.log(e);
    }
  }
  console.log("All the profiles for this session are recorded");

  await getDuration(new Date(), sessionName, count);

  process.exit(0);
}

let csvData = ""; //to save lifetime data

async function loopAxios(min, link) {
  const response = await axios.get(link);
  const data = response.data;
  max = data.maxCursor;
  min = data.minCursor;
  try {
    const loading = setInterval(() => {
      process.stdout.write(".");
    }, 100);
    response.data.userList.map(
      (e) =>
        // console.log(
        //   `${e.user.nickname},https://www.tiktok.com/@${e.user.uniqueId}\n`
        // ) &&
        (csvData += `\n ${e.user.nickname.replaceAll(",", "")},${
          e.user.verified
        },"${e.user.signature.replaceAll('"', "'")}",${e.stats.followerCount},${
          e.stats.followingCount
        },${e.stats.heartCount},${e.stats.videoCount},https://www.tiktok.com/@${
          e.user.uniqueId
        },${fileName},${e.user.uniqueId},${e.user.avatarLarger},${
          e.user.avatarMedium
        },${e.user.avatarThumb},${e.stats.diggCount},${e.user.commentSetting},${
          e.user.downloadSetting
        },${e.user.duetSetting},${e.user.ftc},${e.user.id},${
          e.user.isADVirtual
        },${e.user.openFavorite},${e.user.privateAccount},${e.user.relation},${
          e.user.secUid
        },${e.user.secret},${e.user.stitchSetting},${e.user.ttSeller}`) &&
        count++
    );
    clearInterval(loading);
    console.clear();
  } catch (err) {
    // console.log(err);
    if (csvData.length === 0) {
      console.log("Private Account, skipping the user");
    } else {
      console.log("Saving file for " + fileName);

      //Saving to all_data.csv
      await fs.writeFile(
        "All Data/all_data.csv",
        csvData,
        { flag: "a" },
        (err) => {
          if (err) throw err;
          console.log("Data appended to all_data file");
        }
      );

      //Saving to custom data
      await setHeadingCustom(firstTimeHeading); //adding headings to the custom data file

      await fs.writeFile(
        `Custom Data/${sessionName}.csv`,
        csvData,
        { flag: "a" },
        (err) => {
          if (err) throw err;
          console.log("Session Data appended to file");
        }
      );

      //Saving to individual data and also overwrite if the same file exist.

      await fs.writeFile(
        //adding headings
        `Individual Data/${fileName}.csv`,
        headingsArr.map(
          (e) => {
            return `${e}`;
          },
          (err) => {
            if (err) throw err;
            console.log("Session Data appended to file");
          }
        )
      );
      await fs
        .writeFile(
          `Individual Data/${fileName}.csv`,
          csvData,
          { flag: "a" },
          (err) => {
            if (err) throw err;
            console.log("Individual Data written to file");
          }
        )
        .then((csvData = ""));
    }
  }
  if (min > 0) {
    let newlink = link.replace(/(minCursor=)[^&]*/g, `minCursor=${min}`);
    await loopAxios(min, newlink);
  }
}

async function setHeadingCustom(value) {
  if (!value) {
    await fs
      .writeFile(
        `Custom Data/${sessionName}.csv`,
        headingsArr.map(
          (e) => {
            return `${e}`;
          },
          (err) => {
            if (err) throw err;
            console.log("Session Data appended to file");
          }
        )
      )
      .then((firstTimeHeading = true));
  }
}
